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
                topUniversities: [],
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
        expect(screen.getByText(/Eksplorasi Keunggulan/i)).toBeInTheDocument();
        expect(screen.getByText(/Jurnal Terakreditasi Unggulan/i)).toBeInTheDocument();
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
        const searchInput = screen.getByPlaceholderText(/Cari nama jurnal/i);
        expect(searchInput).toHaveAttribute('aria-label', 'Search academic content');
    });

    it('should perform client-side search using Inertia router', async () => {
        render(<Welcome />);
        const searchInput = screen.getByPlaceholderText(/Cari nama jurnal/i);
        fireEvent.change(searchInput, { target: { value: 'physics' } });

        const searchButton = screen.getByRole('button', { name: /Search/i });
        fireEvent.click(searchButton);

        expect(mockGet).toHaveBeenCalled();
    });
});
