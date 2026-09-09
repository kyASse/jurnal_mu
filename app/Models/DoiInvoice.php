<?php

namespace App\Models;

use App\Enums\Doi\InvoiceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoiInvoice extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'doi_invoices';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'invoice_number',
        'subscription_id',
        'university_id',
        'user_id',
        'period_start',
        'period_end',
        'subtotal',
        'discount',
        'tax',
        'total_amount',
        'due_date',
        'paid_at',
        'status',
        'payment_method',
        'payment_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => InvoiceStatus::class,
        'period_start' => 'date',
        'period_end' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the subscription associated with the invoice
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(DoiSubscription::class, 'subscription_id');
    }

    /**
     * Get the university for this invoice
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id');
    }

    /**
     * Get the user who created/owns this invoice
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get line items for this invoice
     */
    public function items(): HasMany
    {
        return $this->hasMany(DoiInvoiceItem::class, 'invoice_id');
    }

    /**
     * Get payment proofs for this invoice
     */
    public function paymentProofs(): HasMany
    {
        return $this->hasMany(DoiPaymentProof::class, 'invoice_id');
    }

    /**
     * Get the latest payment proof
     */
    public function latestPaymentProof(): HasOne
    {
        return $this->hasOne(DoiPaymentProof::class, 'invoice_id')->latestOfMany();
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope query to unpaid invoices
     */
    public function scopeUnpaid($query)
    {
        return $query->where('status', InvoiceStatus::UNPAID);
    }

    /**
     * Scope query to paid invoices
     */
    public function scopePaid($query)
    {
        return $query->where('status', InvoiceStatus::PAID);
    }

    /**
     * Scope query to pending verification invoices
     */
    public function scopePendingVerification($query)
    {
        return $query->where('status', InvoiceStatus::PENDING_VERIFICATION);
    }
}
