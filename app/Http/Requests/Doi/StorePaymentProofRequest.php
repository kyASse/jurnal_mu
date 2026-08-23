<?php

namespace App\Http\Requests\Doi;

use App\Enums\Doi\InvoiceStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentProofRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $invoice = $this->route('invoice');

        if (!$invoice) {
            return false;
        }

        return $this->user()->can('uploadProof', $invoice);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bank_sender' => ['required', 'string', 'max:100'],
            'account_name' => ['required', 'string', 'max:150'],
            'bank_destination_id' => ['required', 'exists:doi_bank_accounts,id'],
            'transfer_amount' => ['required', 'numeric', 'min:1'],
            'transfer_date' => ['required', 'date', 'before_or_equal:today'],
            'payment_proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'], // 5MB max
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $invoice = $this->route('invoice');
            if ($invoice && $invoice->status === InvoiceStatus::PAID) {
                $validator->errors()->add('invoice', 'Cannot upload payment proof for an invoice that is already paid.');
            }
        });
    }

    /**
     * Custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'bank_sender.required' => 'Nama bank pengirim wajib diisi.',
            'account_name.required' => 'Nama pemilik rekening pengirim wajib diisi.',
            'bank_destination_id.required' => 'Rekening bank tujuan wajib dipilih.',
            'bank_destination_id.exists' => 'Rekening bank tujuan tidak valid.',
            'transfer_amount.required' => 'Jumlah transfer wajib diisi.',
            'transfer_amount.numeric' => 'Jumlah transfer harus berupa angka.',
            'transfer_date.required' => 'Tanggal transfer wajib diisi.',
            'transfer_date.before_or_equal' => 'Tanggal transfer tidak boleh lebih dari hari ini.',
            'payment_proof.required' => 'Bukti pembayaran wajib diunggah.',
            'payment_proof.mimes' => 'Format bukti pembayaran harus JPG, PNG, atau PDF.',
            'payment_proof.max' => 'Ukuran file bukti pembayaran maksimal 5MB.',
        ];
    }
}
