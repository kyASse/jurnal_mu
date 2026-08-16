export type SubscriptionStatusType = 'active' | 'inactive' | 'pending_verification' | 'grace_period' | 'expired';

export type InvoiceStatusType = 'unpaid' | 'pending_verification' | 'paid' | 'expired' | 'cancelled';

export type PaymentProofStatusType = 'pending' | 'approved' | 'rejected';

export type QuotaChangeType = 'allocation' | 'usage' | 'adjustment' | 'renewal';

export type InvoiceItemType = 'annual_fee' | 'similarity_quota' | 'discount' | 'other';

export interface DoiPackageData {
    id: number;
    name: string;
    slug: string;
    code: string;
    description: string | null;
    price_annual: number | string;
    prefix_included: boolean;
    similarity_quota_included: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DoiBankAccountData {
    id: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
    branch_name?: string | null;
    is_active: boolean;
}

export interface DoiInvoiceItemData {
    id: number;
    invoice_id: number;
    item_type: InvoiceItemType;
    description: string;
    quantity: number;
    unit_price: number | string;
    total_price: number | string;
    created_at?: string;
}

export interface DoiPaymentProofData {
    id: number;
    invoice_id: number;
    user_id: number;
    bank_sender: string;
    account_name: string;
    bank_destination_id?: number | null;
    transfer_amount: number | string;
    transfer_date: string;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    status: PaymentProofStatusType;
    verified_by?: number | null;
    verified_at?: string | null;
    admin_notes?: string | null;
    created_at: string;
    updated_at?: string;
    bank_destination?: DoiBankAccountData;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    verifier?: {
        id: number;
        name: string;
    };
}

export interface DoiActiveInvoiceData {
    id: number;
    invoice_number: string;
    subscription_id: number;
    university_id: number;
    user_id: number;
    period_start: string;
    period_end: string;
    subtotal: number | string;
    discount: number | string;
    tax: number | string;
    total_amount: number | string;
    due_date: string;
    paid_at?: string | null;
    status: InvoiceStatusType;
    payment_method?: string | null;
    payment_token?: string | null;
    created_at?: string;
    updated_at?: string;
    items?: DoiInvoiceItemData[];
    payment_proofs?: DoiPaymentProofData[];
    latest_payment_proof?: DoiPaymentProofData | null;
    is_overdue?: boolean;
    days_until_due?: number;
}

export interface DoiQuotaLogData {
    id: number;
    subscription_id: number;
    journal_id?: number | null;
    user_id?: number | null;
    change_type: QuotaChangeType;
    amount: number;
    balance_after: number;
    description?: string | null;
    created_at: string;
    updated_at?: string;
    journal?: {
        id: number;
        title: string;
        issn?: string;
    };
    user?: {
        id: number;
        name: string;
    };
}

export interface DoiSubscriptionData {
    id: number;
    university_id: number;
    journal_id?: number | null;
    doi_package_id: number;
    status: SubscriptionStatusType;
    start_date: string | null;
    end_date: string | null;
    active_prefix: string | null;
    similarity_quota_total: number;
    similarity_quota_used: number;
    remaining_quota?: number;
    is_expiring_soon?: boolean;
    days_remaining?: number | null;
    auto_renew: boolean;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
    package?: DoiPackageData;
    university?: {
        id: number;
        name: string;
        short_name?: string;
        code?: string;
    };
    journal?: {
        id: number;
        title: string;
        issn?: string;
    };
    active_invoice?: DoiActiveInvoiceData | null;
    quota_logs?: DoiQuotaLogData[];
}

export interface DoiDashboardProps {
    subscription: DoiSubscriptionData | null;
    activeInvoice: DoiActiveInvoiceData | null;
    recentQuotaLogs: DoiQuotaLogData[];
    availablePackages: DoiPackageData[];
    registeredJournalsCount: number;
    canManageSubscription?: boolean;
}
