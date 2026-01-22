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
    description: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: Role;
    university_id?: number;
    avatar_url?: string;
    avatar?: string;
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
