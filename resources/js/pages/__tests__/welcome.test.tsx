import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import Welcome from '../welcome';
import fs from 'fs';
import path from 'path';

// Setup mock route
beforeAll(() => {
    (globalThis as any).route = (name: string, _params?: any) => `/route/${name}`;
});

// Mock @inertiajs/react
vi.mock('@inertiajs/react', () => {
    return {
        Link: ({ href, children, ...props }: any) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
        Head: ({ title }: any) => <title>{title}</title>,
        usePage: () => ({
            props: {
                auth: { user: null },
                featuredJournals: [],
                totalUniversities: 10,
                totalJournals: 50,
                totalArticles: 100,
                scientificFields: [],
                upcomingEvents: [],
                featuredArticles: [],
                topUniversities: [],
            },
        }),
    };
});

// Mock layouts
vi.mock('@/layouts/public-layout', () => ({
    default: ({ children }: any) => <div data-testid="public-layout">{children}</div>,
}));

// Mock child components to prevent import errors
vi.mock('@/components/public-navbar', () => ({
    default: () => <div data-testid="public-navbar" />
}));
vi.mock('@/components/public-footer', () => ({
    default: () => <div data-testid="public-footer" />
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    ArrowRight: () => <span>ArrowRight</span>,
    BookOpen: () => <span>BookOpen</span>,
    Calendar: () => <span>Calendar</span>,
    ChevronDown: () => <span>ChevronDown</span>,
    Clock: () => <span>Clock</span>,
    Download: () => <span>Download</span>,
    FileText: () => <span>FileText</span>,
    GraduationCap: () => <span>GraduationCap</span>,
    LayoutDashboard: () => <span>LayoutDashboard</span>,
    Library: () => <span>Library</span>,
    MapPin: () => <span>MapPin</span>,
    Search: () => <span>Search</span>,
    User: () => <span>User</span>,
}));

describe('Welcome Page Redesign', () => {
    it('should render welcome page without crashing', () => {
        render(<Welcome />);
        expect(screen.getByText(/Discover Muhammadiyah/i)).toBeInTheDocument();
    });

    it('should not contain hardcoded green, old navy, or yellow hex colors in welcome.tsx', () => {
        const welcomePath = path.resolve(__dirname, '../welcome.tsx');
        const content = fs.readFileSync(welcomePath, 'utf8').toLowerCase();

        expect(content).not.toContain('#079c4e');
        expect(content).not.toContain('#1a2a75');
        expect(content).not.toContain('#fcee1f');
    });
});
