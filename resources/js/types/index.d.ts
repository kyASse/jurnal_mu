import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: Role;
    roles?: Role[]; // Multi-role support
    university_id?: number;
    avatar_url?: string;
    avatar?: string;
    is_reviewer?: boolean;
}

export interface University {
    id: number;
    code: string;
    ptm_code?: string;
    name: string;
    short_name?: string;
    address?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo_url?: string;
    accreditation_status?: string;
    cluster?: string;
    profile_description?: string;
    is_active: boolean;
    users_count?: number;
    journals_count?: number;
    full_address?: string;
    created_at?: string;
    updated_at?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};

// Journal related types
export interface ScientificField {
    id: number;
    name: string;
}

export interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn?: string;
    url?: string;
    university_id: number;
    user_id: number;
    scientific_field_id?: number;
    university: University;
    user: User;
    scientific_field?: ScientificField;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Assessment related types
export interface EvaluationCategory {
    id: number;
    name: string;
}

export interface EvaluationSubCategory {
    id: number;
    category_id: number;
    name: string;
    category?: EvaluationCategory;
}

export interface EvaluationIndicator {
    id: number;
    sub_category_id: number;
    question: string;
    answer_type: 'boolean' | 'scale' | 'text';
    requires_attachment: boolean;
    weight: number;
    sub_category?: EvaluationSubCategory;
}

export interface AssessmentAttachment {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
}

export interface AssessmentResponse {
    id: number;
    journal_assessment_id: number;
    evaluation_indicator_id: number;
    answer_boolean?: boolean;
    answer_scale?: number;
    answer_text?: string;
    score: number;
    notes?: string;
    evaluation_indicator?: EvaluationIndicator;
    attachments?: AssessmentAttachment[];
}

export interface JournalAssessment {
    id: number;
    journal_id: number;
    user_id: number;
    assessment_date: string;
    period?: string;
    status: 'draft' | 'submitted' | 'reviewed';
    submitted_at?: string;
    reviewed_at?: string;
    reviewed_by?: number;
    total_score?: number;
    max_score?: number;
    percentage?: number;
    notes?: string;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    journal: Journal;
    user: User;
    reviewer?: User;
    responses?: AssessmentResponse[];
}

// Pagination types
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    from: number;
    to: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

// Pembinaan (v1.1) types
export interface AccreditationTemplate {
    id: number;
    name: string;
    type: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Pembinaan {
    id: number;
    name: string;
    description?: string;
    category: 'akreditasi' | 'indeksasi';
    status: 'draft' | 'active' | 'closed';
    accreditation_template_id?: number;
    accreditation_template?: AccreditationTemplate;
    registration_start: string;
    registration_end: string;
    assessment_start: string;
    assessment_end: string;
    quota?: number;
    registrations_count?: number;
    pending_registrations_count?: number;
    approved_registrations_count?: number;
    creator?: User;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface PembinaanRegistration {
    id: number;
    pembinaan_id: number;
    journal_id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'rejected';
    registered_at: string;
    reviewed_at?: string;
    reviewed_by?: number;
    rejection_reason?: string;
    pembinaan?: Pembinaan;
    journal?: Journal;
    user?: User;
    reviewer?: User;
    attachments?: PembinaanRegistrationAttachment[];
    reviews?: PembinaanReview[];
    reviewer_assignments?: ReviewerAssignment[];
    attachments_count?: number;
    reviews_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface PembinaanRegistrationAttachment {
    id: number;
    registration_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size?: number;
    document_type?: string;
    uploaded_by: number;
    uploader?: User;
    created_at?: string;
}

export interface PembinaanReview {
    id: number;
    registration_id: number;
    reviewer_id: number;
    score?: number;
    feedback?: string;
    recommendation?: string;
    reviewed_at: string;
    registration?: PembinaanRegistration;
    reviewer?: User;
    created_at?: string;
}

export interface ReviewerAssignment {
    id: number;
    reviewer_id: number;
    registration_id: number;
    assigned_by: number;
    assigned_at: string;
    status: 'assigned' | 'in_progress' | 'completed';
    reviewer?: User;
    registration?: PembinaanRegistration;
    assigner?: User;
    created_at?: string;
    updated_at?: string;
}
