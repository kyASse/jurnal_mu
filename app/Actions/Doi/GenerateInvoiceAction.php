<?php

namespace App\Actions\Doi;

use App\Enums\Doi\InvoiceItemType;
use App\Enums\Doi\InvoiceStatus;
use App\Models\DoiInvoice;
use App\Models\DoiInvoiceItem;
use App\Models\DoiSubscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GenerateInvoiceAction
{
    /**
     * Generate a new sequential invoice for a DOI subscription.
     *
     * @param  DoiSubscription  $subscription
     * @param  User|null  $user
     * @param  array  $customItems
     * @param  array  $options
     * @return DoiInvoice
     */
    public function execute(
        DoiSubscription $subscription,
        ?User $user = null,
        array $customItems = [],
        array $options = []
    ): DoiInvoice {
        return DB::transaction(function () use ($subscription, $user, $customItems, $options) {
            $now = Carbon::now();
            $periodStart = isset($options['period_start'])
                ? Carbon::parse($options['period_start'])
                : ($subscription->start_date ?? $now);
            $periodEnd = isset($options['period_end'])
                ? Carbon::parse($options['period_end'])
                : ($subscription->end_date ?? $periodStart->copy()->addYear());
            $dueDate = isset($options['due_date'])
                ? Carbon::parse($options['due_date'])
                : $now->copy()->addDays(14);

            $monthYear = $now->format('Ym');
            $prefix = "INV/DOI/{$monthYear}/";

            // Find highest sequence with lockForUpdate to prevent race condition
            $lastInvoice = DoiInvoice::where('invoice_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->orderByDesc('id')
                ->first();

            $sequence = 1;
            if ($lastInvoice && preg_match('/(\d{4})$/', $lastInvoice->invoice_number, $matches)) {
                $sequence = (int) $matches[1] + 1;
            }

            $invoiceNumber = $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);

            // Prepare items
            $items = $customItems;
            if (empty($items)) {
                $package = $subscription->package;
                if ($package) {
                    $items[] = [
                        'description' => "Biaya Tahunan Keanggotaan Crossref - {$package->name}",
                        'item_type' => InvoiceItemType::ANNUAL_FEE,
                        'unit_price' => $package->price_annual,
                        'quantity' => 1,
                        'total_price' => $package->price_annual,
                    ];
                }
            }

            $subtotal = 0;
            foreach ($items as $item) {
                $subtotal += (float) ($item['total_price'] ?? ($item['unit_price'] * ($item['quantity'] ?? 1)));
            }

            $discount = (float) ($options['discount'] ?? 0);
            $tax = (float) ($options['tax'] ?? 0);
            $totalAmount = max(0, $subtotal - $discount + $tax);

            $userId = $user?->id ?? auth()->id() ?? $subscription->journal?->user_id;

            $invoice = DoiInvoice::create([
                'invoice_number' => $invoiceNumber,
                'subscription_id' => $subscription->id,
                'university_id' => $subscription->university_id,
                'user_id' => $userId,
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total_amount' => $totalAmount,
                'due_date' => $dueDate->toDateString(),
                'status' => InvoiceStatus::UNPAID,
            ]);

            foreach ($items as $itemData) {
                $itemType = $itemData['item_type'] instanceof InvoiceItemType
                    ? $itemData['item_type']
                    : (InvoiceItemType::tryFrom($itemData['item_type'] ?? '') ?? InvoiceItemType::ANNUAL_FEE);

                $unitPrice = (float) ($itemData['unit_price'] ?? 0);
                $quantity = (int) ($itemData['quantity'] ?? 1);
                $totalPrice = (float) ($itemData['total_price'] ?? ($unitPrice * $quantity));

                DoiInvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $itemData['description'] ?? 'Layanan Crossref & Similarity Check',
                    'item_type' => $itemType,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'total_price' => $totalPrice,
                ]);
            }

            return $invoice->load('items', 'subscription', 'university', 'user');
        });
    }
}
