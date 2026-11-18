import { fireEvent, render, screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Welcome from '../welcome';

const { mockGet } = vi.hoisted(() => {
    return {
        mockGet: vi.fn(),
    };
});

// Setup mock route
beforeAll(() => {
    (globalThis as any).route = (name: string, _params?: any) => `/route/${name}`;
});

// Mock @inertiajs/react
vi.mock('@inertiajs/react', () => {
    return {
        router: {
            get: mockGet,
        },
        Link: ({ href, children, ...props }: any) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
        Head: ({ title }: any) => <title>{title}</title>,
        usePage: () => ({
            props: {
                auth: { user: null },
                featuredJournals: [
                    {
                        id: 1,
                        title: 'Jurnal Ilmiah Farmasi',
                        sinta_rank: 'S1',
                        sinta_rank_label: 'SINTA 1',
                        issn: '2085-1234',
                        e_issn: '2548-5678',
                        university: 'Universitas Muhammadiyah Surakarta',
                        indexation_labels: ['Scopus', 'WoS'],
                    },
                ],
                totalUniversities: 10,
                totalJournals: 50,
                totalArticles: 100,
                scientificFields: [],
                upcomingEvents: [],
                featuredArticles: [],
                topUniversities: [
                    {
                        id: 1,
                        name: 'Universitas Ahmad Dahlan',
                        short_name: 'UAD',
                        city: 'Yogyakarta',
                        province: 'Daerah Istimewa Yogyakarta',
                        logo_url: null,
                        journals_count: 66,
                    },
                    {
                        id: 2,
                        name: 'Universitas Muhammadiyah Malang',
                        short_name: 'UMM',
                        city: 'Malang',
                        province: 'Jawa Timur',
                        logo_url: null,
                        journals_count: 63,
                    },
                ],
            },
        }),
    };
});

// Mock layouts
vi.mock('@/layouts/public-layout', () => ({
    default: ({ children }: any) => <div data-testid="public-layout">{children}</div>,
}));

// Mock child components
vi.mock('@/components/public-navbar', () => ({
    default: () => <div data-testid="public-navbar" />,
}));
vi.mock('@/components/public-footer', () => ({
    default: () => <div data-testid="public-footer" />,
}));

beforeEach(() => {
    mockGet.mockClear();
});

describe('Welcome Page Redesign', () => {
    it('should render welcome page with hero and featured bento without crashing', () => {
        render(<Welcome />);
        expect(screen.getByText(/Discover Muhammadiyah's/i)).toBeInTheDocument();
        expect(screen.getByText(/Scientific Excellence/i)).toBeInTheDocument();
        expect(screen.getByText(/Featured Journals/i)).toBeInTheDocument();
        expect(screen.getByText('Jurnal Ilmiah Farmasi')).toBeInTheDocument();
    });

    it('should not contain hardcoded green, old navy, or yellow hex colors in welcome.tsx', () => {
        const welcomePath = path.resolve(__dirname, '../welcome.tsx');
        const content = fs.readFileSync(welcomePath, 'utf8').toLowerCase();

        expect(content).not.toContain('#079c4e');
        expect(content).not.toContain('#1a2a75');
        expect(content).not.toContain('#fcee1f');
    });

    it('should not contain external texture URLs in welcome.tsx', () => {
        const welcomePath = path.resolve(__dirname, '../welcome.tsx');
        const content = fs.readFileSync(welcomePath, 'utf8');

        expect(content).not.toContain('transparenttextures.com');
    });

    it('should not use w-screen bleed that causes horizontal scrollbar on Windows', () => {
        const welcomePath = path.resolve(__dirname, '../welcome.tsx');
        const content = fs.readFileSync(welcomePath, 'utf8');

        expect(content).not.toContain('w-screen -translate-x-1/2');
    });

    it('should have accessibility labels on search input', () => {
        render(<Welcome />);
        const searchInput = screen.getByPlaceholderText(/Search for journals/i);
        expect(searchInput).toHaveAttribute('aria-label', 'Search academic content');
    });

    it('should perform client-side search using Inertia router', async () => {
        render(<Welcome />);
        const searchInput = screen.getByPlaceholderText(/Search for journals/i);
        fireEvent.change(searchInput, { target: { value: 'physics' } });

        const searchButton = screen.getByRole('button', { name: /Search/i });
        fireEvent.click(searchButton);

        expect(mockGet).toHaveBeenCalled();
    });

    it('should render top universities cards with links and badges', () => {
        render(<Welcome />);
        expect(screen.getByText('Top Universities')).toBeInTheDocument();
        expect(screen.getByText('Universitas Ahmad Dahlan')).toBeInTheDocument();
        expect(screen.getByText('66 Journals')).toBeInTheDocument();
        expect(screen.getByText('Universitas Muhammadiyah Malang')).toBeInTheDocument();
        expect(screen.getByText('63 Journals')).toBeInTheDocument();
        expect(screen.getByText('Browse All Universities')).toBeInTheDocument();
    });

    it('should configure top universities section with grid-cols-1 and responsive flex header for mobile', () => {
        const welcomePath = path.resolve(__dirname, '../welcome.tsx');
        const content = fs.readFileSync(welcomePath, 'utf8');

        // Verify grid has grid-cols-1 for base mobile breakpoint to prevent card overflow
        expect(content).toMatch(/grid\s+grid-cols-1\s+gap-4\s+sm:gap-6\s+sm:grid-cols-2\s+lg:grid-cols-3/);
        // Verify header uses responsive flex stacking (flex-col sm:flex-row)
        expect(content).toMatch(/flex\s+flex-col\s+gap-4\s+sm:mb-12\s+sm:flex-row\s+sm:items-end\s+sm:justify-between/);
    });
});
