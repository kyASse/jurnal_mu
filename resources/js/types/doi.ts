import { PaginatedData } from './index';

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
    features?: string[] | null;
    is_featured?: boolean;
    badge_text?: string | null;
    sort_order?: number;
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
    branch?: string | null;
    qr_code_path?: string | null;
    is_active?: boolean;
}

export interface DoiInvoiceItemData {
    id: number;
    invoice_id?: number;
    item_type?: InvoiceItemType;
    description: string;
    quantity: number;
    unit_price: number | string;
    total_price: number | string;
    created_at?: string;
}

export interface DoiPaymentProofData {
    id: number;
    invoice_id?: number;
    user_id?: number;
    bank_sender: string;
    account_name: string;
    bank_destination_id?: number | null;
    bank_destination?: string | DoiBankAccountData | null;
    transfer_amount: number | string;
    transfer_date: string;
    file_path?: string;
    file_name: string;
    file_size?: number;
    mime_type?: string;
    status: PaymentProofStatusType;
    status_label?: string;
    verified_by?: number | null;
    verified_at?: string | null;
    admin_notes?: string | null;
    created_at: string;
    updated_at?: string;
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
    subscription_id?: number;
    university_id?: number;
    user_id?: number;
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

export interface DoiInvoiceDetailData {
    id: number;
    invoice_number: string;
    subscription_id?: number;
    subtotal: number | string;
    discount: number | string;
    tax: number | string;
    total_amount: number | string;
    due_date: string;
    paid_at?: string | null;
    status: InvoiceStatusType;
    status_label?: string;
    status_color?: string;
    period_start?: string;
    period_end?: string;
    package_name?: string;
    package?: {
        name: string;
        code?: string;
        description?: string | null;
    } | null;
    items_count?: number;
    items?: DoiInvoiceItemData[];
    payment_proofs?: DoiPaymentProofData[];
    latest_payment_proof?: DoiPaymentProofData | {
        id: number;
        status: PaymentProofStatusType;
        status_label?: string;
        admin_notes?: string | null;
        created_at?: string;
    } | null;
    university_name?: string;
    university?: {
        id: number;
        name: string;
        short_name?: string;
    };
    user?: {
        id: number;
        name: string;
        email: string;
    };
    created_at?: string;
    updated_at?: string;
}

export interface DoiInvoiceStatsData {
    total_invoices: number;
    unpaid_amount: number;
    paid_amount: number;
    unpaid_count?: number;
    paid_count?: number;
    pending_count?: number;
}

export interface DoiInvoicesPageProps {
    invoices: PaginatedData<DoiInvoiceDetailData>;
    bankAccounts: DoiBankAccountData[];
    stats?: DoiInvoiceStatsData;
    filters?: {
        status?: string;
        search?: string;
    };
}

export interface StorePaymentProofFormData {
    bank_sender: string;
    account_name: string;
    bank_destination_id: number | string;
    transfer_amount: number | string;
    transfer_date: string;
    notes?: string;
    payment_proof: File | null;
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

export interface DoiSettingsData {
    doi_helpdesk_email?: string;
    doi_helpdesk_phone?: string;
    doi_helpdesk_hours?: string;
    doi_helpdesk_notes?: string;
    [key: string]: string | undefined;
}

export interface DoiDashboardProps {
    subscription: DoiSubscriptionData | null;
    activeInvoice: DoiActiveInvoiceData | null;
    recentQuotaLogs: DoiQuotaLogData[];
    availablePackages: DoiPackageData[];
    registeredJournalsCount: number;
    canManageSubscription?: boolean;
    doiSettings?: DoiSettingsData;
}

export interface DoiAdminStatsData {
    total_subscriptions: number;
    active_subscriptions: number;
    pending_proofs_count: number;
    total_revenue: number;
    used_similarity_quota?: number;
    total_similarity_quota?: number;
}

export interface SuperAdminDoiManagementProps {
    stats: DoiAdminStatsData;
    pendingProofs: (DoiPaymentProofData & {
        invoice?: DoiActiveInvoiceData & {
            university?: { id: number; name: string; short_name?: string; code?: string };
            subscription?: DoiSubscriptionData & { package?: DoiPackageData };
        };
    })[];
    subscriptions: PaginatedData<DoiSubscriptionData>;
    packages: (DoiPackageData & { subscriptions_count?: number })[];
    bankAccounts: DoiBankAccountData[];
    doiSettings?: DoiSettingsData;
    filters?: {
        status?: string;
        search?: string;
    };
}

export interface VerificationReviewData {
    proof: DoiPaymentProofData & {
        invoice?: DoiActiveInvoiceData & {
            university?: { id: number; name: string; short_name?: string; code?: string };
            subscription?: DoiSubscriptionData & { package?: DoiPackageData };
        };
    };
    invoice?: DoiInvoiceDetailData | DoiActiveInvoiceData | null;
    subscription?: DoiSubscriptionData | null;
}

export interface AdjustQuotaFormData {
    amount: number;
    change_type?: QuotaChangeType;
    description: string;
}

export interface DoiPackageFormData {
    name: string;
    slug?: string;
    code: string;
    description?: string | null;
    price_annual: number | string;
    prefix_included: boolean;
    similarity_quota_included: number;
    features?: string[];
    is_featured?: boolean;
    badge_text?: string | null;
    sort_order?: number;
    is_active: boolean;
}

export interface DoiBankAccountFormData {
    bank_name: string;
    account_number: string;
    account_holder: string;
    branch_name?: string | null;
    branch?: string | null;
    qr_code_path?: string | null;
    is_active: boolean;
    display_order?: number;
}


