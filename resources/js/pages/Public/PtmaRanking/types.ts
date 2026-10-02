export interface PtmaUniversity {
    id: number;
    name: string;
    short_name?: string | null;
    code?: string | null;
    ptm_code?: string | null;
    logo_url?: string | null;
    accreditation_status?: string | null;
    city?: string | null;
    province?: string | null;
}

export interface PtmaMetric {
    id: number;
    university_id?: number;
    ranking_position: number;
    sinta_score_overall: number | string;
    sinta_score_3yr: number | string;
    national_rank_overall?: number | null;
    national_rank_3yr?: number | null;
    scopus_docs: number;
    scopus_citations?: number;
    wos_docs: number;
    wos_citations?: number;
    garuda_docs: number;
    garuda_citations?: number;
    google_docs?: number;
    google_citations?: number;
    research_count: number;
    service_count: number;
    ipr_count: number;
    book_count?: number;
    authors_count?: number;
    departments_count?: number;
    journals_count?: number;
    last_synced_at?: string | null;
    university: PtmaUniversity;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedMetrics {
    data: PtmaMetric[];
    current_page: number;
    from?: number;
    to?: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
    prev_page_url?: string | null;
    next_page_url?: string | null;
}
