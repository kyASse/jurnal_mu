import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminSintaIndex from '../Index';

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
    router: {
        post: vi.fn(),
    },
    Link: ({ children, href, preserveState, preserveScroll, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    Head: ({ children, title }: any) => <title>{title}</title>,
}));

// Mock layout
vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: any) => <div data-testid="app-layout">{children}</div>,
}));

// Mock ziggy route
(globalThis as any).route = vi.fn((name: string) => `/mocked-${name}`);

describe('AdminSintaIndex Pagination', () => {
    const mockSummary = {
        total_ptma: 100,
        synced_success: 80,
        synced_failed: 20,
        mock_mode: true,
    };

    const mockMetrics = {
        data: [
            {
                id: 1,
                university_id: 10,
                ptm_code: '051010',
                sinta_score_overall: 345000,
                sync_status: 'success',
                last_synced_at: '2026-10-02T10:00:00Z',
                university: {
                    id: 10,
                    name: 'Universitas Muhammadiyah Surakarta',
                    code: 'UMS',
                },
            },
        ],
        current_page: 1,
        per_page: 30,
        total: 100,
        links: [
            { url: null, label: '&laquo; Previous', active: false },
            { url: '/admin/sinta?page=1', label: '1', active: true },
            { url: '/admin/sinta?page=2', label: '2', active: false },
            { url: '/admin/sinta?page=2', label: 'Next &raquo;', active: false },
        ],
    };

    it('renders disabled button when link.url is null', () => {
        render(<AdminSintaIndex metrics={mockMetrics as any} summary={mockSummary} />);

        // The first link (Previous) has url: null, so it should render as a disabled button
        const disabledButtons = screen.getAllByRole('button').filter(
            (btn) => btn.hasAttribute('disabled')
        );

        expect(disabledButtons.length).toBeGreaterThan(0);
    });
});
