<?php

namespace App\Models;

use App\Enums\Doi\PaymentProofStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoiPaymentProof extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'doi_payment_proofs';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'invoice_id',
        'user_id',
        'bank_sender',
        'account_name',
        'bank_destination_id',
        'transfer_amount',
        'transfer_date',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'status',
        'verified_by',
        'verified_at',
        'admin_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => PaymentProofStatus::class,
        'transfer_amount' => 'decimal:2',
        'transfer_date' => 'date',
        'verified_at' => 'datetime',
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the invoice for this payment proof
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(DoiInvoice::class, 'invoice_id');
    }

    /**
     * Get the user who uploaded the payment proof
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the destination bank account
     */
    public function bankDestination(): BelongsTo
    {
        return $this->belongsTo(DoiBankAccount::class, 'bank_destination_id');
    }

    /**
     * Get the user who verified this payment proof
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope query to pending payment proofs
     */
    public function scopePending($query)
    {
        return $query->where('status', PaymentProofStatus::PENDING);
    }

    /**
     * Scope query to approved payment proofs
     */
    public function scopeApproved($query)
    {
        return $query->where('status', PaymentProofStatus::APPROVED);
    }

    /**
     * Scope query to rejected payment proofs
     */
    public function scopeRejected($query)
    {
        return $query->where('status', PaymentProofStatus::REJECTED);
    }
}
