import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { PtmaDetailDrawer } from '../components/PtmaDetailDrawer';
import PtmaRankingIndex from '../Index';
import { PtmaMetric } from '../types';

// Mock Inertia router
const mockRouterVisit = vi.fn();
const mockRouterGet = vi.fn();
vi.mock('@inertiajs/react', () => ({
    router: {
        visit: (url: string, options?: any) => mockRouterVisit(url, options),
        get: (url: string, data?: any, options?: any) => mockRouterGet(url, data, options),
    },
    Head: ({ children, title }: any) => <title>{title}</title>,
}));

// Mock layout
vi.mock('@/layouts/public-layout', () => ({
    default: ({ children }: any) => <div data-testid="public-layout">{children}</div>,
}));

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, layoutId, className }: any) => (
            <div data-testid={layoutId || 'motion-div'} className={className}>
                {children}
            </div>
        ),
    },
}));

describe('LeaderboardRow Component', () => {
    const mockMetric: PtmaMetric = {
        id: 1,
        ranking_position: 1,
        sinta_score_overall: 345678,
        sinta_score_3yr: 123456,
        scopus_docs: 1450,
        garuda_docs: 3200,
        wos_docs: 420,
        ipr_count: 310,
        research_count: 520,
        service_count: 280,
        book_count: 150,
        authors_count: 850,
        journals_count: 18,
        university: {
            id: 10,
            name: 'Universitas Muhammadiyah Surakarta',
            short_name: 'UMS',
            code: 'UMS',
            accreditation_status: 'Unggul',
            city: 'Surakarta',
            province: 'Jawa Tengah',
        },
    };

    it('renders rank #1 badge, university info, and formatted score in id-ID locale', () => {
        const onSelectDetail = vi.fn();

        render(
            <LeaderboardRow
                metric={mockMetric}
                currentSort="sinta_overall"
                topValue={345678}
                onSelectDetail={onSelectDetail}
            />
        );

        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('Universitas Muhammadiyah Surakarta')).toBeInTheDocument();
        expect(screen.getByText('(UMS)')).toBeInTheDocument();
        expect(screen.getByText('Akreditasi Unggul')).toBeInTheDocument();
        expect(screen.getByText('Surakarta')).toBeInTheDocument();
        expect(screen.getByText('345.678')).toBeInTheDocument();
    });

    it('dynamically adapts metric and label when sort is changed to scopus', () => {
        const onSelectDetail = vi.fn();

        render(
            <LeaderboardRow
                metric={mockMetric}
                currentSort="scopus"
                topValue={2000}
                onSelectDetail={onSelectDetail}
            />
        );

        expect(screen.getByText('1.450')).toBeInTheDocument();
        expect(screen.getByText('Dokumen Scopus')).toBeInTheDocument();
    });

    it('invokes onSelectDetail callback when clicking the Rincian button', () => {
        const onSelectDetail = vi.fn();

        render(
            <LeaderboardRow
                metric={mockMetric}
                currentSort="sinta_overall"
                topValue={345678}
                onSelectDetail={onSelectDetail}
            />
        );

        const detailBtn = screen.getByRole('button', { name: /rincian/i });
        fireEvent.click(detailBtn);

        expect(onSelectDetail).toHaveBeenCalledTimes(1);
        expect(onSelectDetail).toHaveBeenCalledWith(mockMetric);
    });

    it('renders appropriate badges for Rank 2, 3, and 4+', () => {
        const rank2 = { ...mockMetric, id: 2, ranking_position: 2 };
        const rank3 = { ...mockMetric, id: 3, ranking_position: 3 };
        const rank4 = { ...mockMetric, id: 4, ranking_position: 4 };

        const { rerender } = render(
            <LeaderboardRow
                metric={rank2}
                currentSort="sinta_overall"
                topValue={345678}
                onSelectDetail={vi.fn()}
            />
        );
        expect(screen.getByText('#2')).toBeInTheDocument();

        rerender(
            <LeaderboardRow
                metric={rank3}
                currentSort="sinta_overall"
                topValue={345678}
                onSelectDetail={vi.fn()}
            />
        );
        expect(screen.getByText('#3')).toBeInTheDocument();

        rerender(
            <LeaderboardRow
                metric={rank4}
                currentSort="sinta_overall"
                topValue={345678}
                onSelectDetail={vi.fn()}
            />
        );
        expect(screen.getByText('#4')).toBeInTheDocument();
    });
});

describe('LeaderboardTable Component', () => {
    const mockMetrics: PtmaMetric[] = [
        {
            id: 1,
            ranking_position: 1,
            sinta_score_overall: 300000,
            sinta_score_3yr: 100000,
            scopus_docs: 1000,
            garuda_docs: 2500,
            wos_docs: 300,
            ipr_count: 200,
            research_count: 400,
            service_count: 200,
            university: {
                id: 1,
                name: 'Universitas Muhammadiyah Yogyakarta',
                short_name: 'UMY',
                accreditation_status: 'Unggul',
                city: 'Bantul',
            },
        },
        {
            id: 2,
            ranking_position: 2,
            sinta_score_overall: 200000,
            sinta_score_3yr: 80000,
            scopus_docs: 800,
            garuda_docs: 2000,
            wos_docs: 250,
            ipr_count: 150,
            research_count: 300,
            service_count: 150,
            university: {
                id: 2,
                name: 'Universitas Ahmad Dahlan',
                short_name: 'UAD',
                accreditation_status: 'Unggul',
                city: 'Yogyakarta',
            },
        },
    ];

    it('renders empty state when no metrics match filter', () => {
        render(
            <LeaderboardTable
                metrics={[]}
                currentSort="sinta_overall"
                onSelectDetail={vi.fn()}
            />
        );

        expect(
            screen.getByText('Tidak ada kampus yang cocok dengan kriteria pencarian')
        ).toBeInTheDocument();
    });

    it('renders all rows and displays total metrics count header', () => {
        render(
            <LeaderboardTable
                metrics={mockMetrics}
                currentSort="sinta_overall"
                onSelectDetail={vi.fn()}
            />
        );

        expect(screen.getByText('Universitas Muhammadiyah Yogyakarta')).toBeInTheDocument();
        expect(screen.getByText('Universitas Ahmad Dahlan')).toBeInTheDocument();
        expect(screen.getByText(/Menampilkan 2 Perguruan Tinggi/i)).toBeInTheDocument();
    });

    it('renders pagination controls and triggers navigation on link click', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        const pagination = {
            current_page: 1,
            last_page: 3,
            total: 50,
            per_page: 20,
            links: [
                { url: null, label: '&laquo; Previous', active: false },
                { url: '/ptma/ranking?page=1', label: '1', active: true },
                { url: '/ptma/ranking?page=2', label: '2', active: false },
                { url: '/ptma/ranking?page=3', label: '3', active: false },
                { url: '/ptma/ranking?page=2', label: 'Next &raquo;', active: false },
            ],
        };

        render(
            <LeaderboardTable
                metrics={mockMetrics}
                currentSort="sinta_overall"
                onSelectDetail={vi.fn()}
                pagination={pagination}
            />
        );

        expect(screen.getByText(/50 total kampus/i)).toBeInTheDocument();
        const page2Button = screen.getByRole('button', { name: '2' });
        fireEvent.click(page2Button);

        expect(mockRouterVisit).toHaveBeenCalledWith('/ptma/ranking?page=2', {
            preserveState: true,
            preserveScroll: true,
        });
    });
});

describe('PtmaDetailDrawer Component', () => {
    const mockMetric: PtmaMetric = {
        id: 1,
        ranking_position: 1,
        sinta_score_overall: 345678,
        sinta_score_3yr: 123456,
        national_rank_overall: 12,
        scopus_docs: 1450,
        scopus_citations: 5600,
        garuda_docs: 3200,
        garuda_citations: 4500,
        wos_docs: 420,
        wos_citations: 1200,
        ipr_count: 310,
        book_count: 150,
        research_count: 520,
        service_count: 280,
        authors_count: 850,
        journals_count: 18,
        university: {
            id: 10,
            name: 'Universitas Muhammadiyah Surakarta',
            short_name: 'UMS',
            code: 'UMS',
            accreditation_status: 'Unggul',
            city: 'Surakarta',
            province: 'Jawa Tengah',
        },
    };

    it('returns null when metric is null', () => {
        const { container } = render(<PtmaDetailDrawer metric={null} onClose={vi.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders scorecard 2-column bento breakdown with all variables', () => {
        render(<PtmaDetailDrawer metric={mockMetric} onClose={vi.fn()} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Scorecard Kampus')).toBeInTheDocument();
        expect(screen.getByText('PTMA Rank #1')).toBeInTheDocument();
        expect(screen.getByText('BAN-PT: Unggul')).toBeInTheDocument();
        expect(screen.getByText('Nasional: #12')).toBeInTheDocument();

        // Check variables
        expect(screen.getByText('SINTA Overall')).toBeInTheDocument();
        expect(screen.getByText('345.678')).toBeInTheDocument();
        expect(screen.getByText('SINTA 3 Tahun')).toBeInTheDocument();
        expect(screen.getByText('123.456')).toBeInTheDocument();
        expect(screen.getByText('Scopus Dokumen')).toBeInTheDocument();
        expect(screen.getByText('1.450')).toBeInTheDocument();
        expect(screen.getByText('Sitasi Scopus')).toBeInTheDocument();
        expect(screen.getByText('5.600')).toBeInTheDocument();
        expect(screen.getByText('Garuda Dokumen')).toBeInTheDocument();
        expect(screen.getByText('3.200')).toBeInTheDocument();
        expect(screen.getByText('Paten / HKI')).toBeInTheDocument();
        expect(screen.getByText('310')).toBeInTheDocument();
        expect(screen.getByText('Penelitian')).toBeInTheDocument();
        expect(screen.getByText('520')).toBeInTheDocument();
        expect(screen.getByText('Pengabdian (PkM)')).toBeInTheDocument();
        expect(screen.getByText('280')).toBeInTheDocument();
        expect(screen.getByText('Dosen Terdaftar')).toBeInTheDocument();
        expect(screen.getByText('850')).toBeInTheDocument();
        expect(screen.getByText('Jurnal Kampus')).toBeInTheDocument();
        expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('closes on close button click and on ESC keydown', () => {
        const onClose = vi.fn();
        render(<PtmaDetailDrawer metric={mockMetric} onClose={onClose} />);

        // Close button click
        const closeBtn = screen.getByLabelText('Tutup panel');
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);

        // ESC keydown
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('copies link with campus query param when Salin Tautan is clicked', async () => {
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: writeTextMock,
            },
            writable: true,
            configurable: true,
        });

        render(<PtmaDetailDrawer metric={mockMetric} onClose={vi.fn()} />);

        const copyBtn = screen.getByRole('button', { name: /salin tautan/i });
        await act(async () => {
            fireEvent.click(copyBtn);
        });

        expect(writeTextMock).toHaveBeenCalledTimes(1);
        const copiedUrl = writeTextMock.mock.calls[0][0];
        expect(copiedUrl).toContain('campus=UMS');

        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            writable: true,
            configurable: true,
        });
    });
});

describe('PtmaRanking Index Page Component', () => {
    const mockStats = {
        total_ptma_indexed: 172,
        collective_scopus_docs: 25430,
        collective_garuda_docs: 84120,
        collective_ipr_count: 5120,
        top_university_score: 345678,
    };

    const mockRankings = {
        data: [
            {
                id: 1,
                ranking_position: 1,
                sinta_score_overall: 345678,
                sinta_score_3yr: 123456,
                scopus_docs: 1450,
                garuda_docs: 3200,
                wos_docs: 420,
                ipr_count: 310,
                research_count: 520,
                service_count: 280,
                university: {
                    id: 10,
                    name: 'Universitas Muhammadiyah Surakarta',
                    short_name: 'UMS',
                    accreditation_status: 'Unggul',
                    city: 'Surakarta',
                },
            },
        ],
        current_page: 1,
        last_page: 1,
        total: 1,
        per_page: 25,
        links: [],
    };

    it('assembles SEO head, hero bento, nav, filter bar, and leaderboard table', () => {
        render(
            <PtmaRankingIndex
                rankings={mockRankings}
                stats={mockStats}
                filters={{ sort: 'sinta_overall' }}
            />
        );

        expect(screen.getByText('Benchmark Institusi PTMA')).toBeInTheDocument();
        expect(screen.getByText('Peringkat Riset SINTA PTMA')).toBeInTheDocument();
        expect(screen.getByText('Total PTMA Terindeks')).toBeInTheDocument();
        expect(screen.getAllByText('Skor SINTA Overall').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByPlaceholderText(/Cari nama atau singkatan PTMA/i)).toBeInTheDocument();
        expect(screen.getByText('Universitas Muhammadiyah Surakarta')).toBeInTheDocument();
    });

    it('opens PtmaDetailDrawer when detail action is clicked on row', () => {
        render(
            <PtmaRankingIndex
                rankings={mockRankings}
                stats={mockStats}
                filters={{ sort: 'sinta_overall' }}
            />
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        const detailBtn = screen.getByRole('button', { name: /rincian/i });
        fireEvent.click(detailBtn);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Scorecard Kampus')).toBeInTheDocument();
    });
});
