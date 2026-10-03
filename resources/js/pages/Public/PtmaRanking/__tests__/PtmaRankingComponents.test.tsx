import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FilterControlBar } from '../components/FilterControlBar';
import { PtmaHeroBento, PtmaHeroStats } from '../components/PtmaHeroBento';
import { VariableSegmentedNav } from '../components/VariableSegmentedNav';

// Mock Inertia router
const mockRouterGet = vi.fn();
vi.mock('@inertiajs/react', () => ({
    router: {
        get: (url: string, data?: any, options?: any) => mockRouterGet(url, data, options),
    },
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

describe('PtmaHeroBento Component', () => {
    const mockStats: PtmaHeroStats = {
        total_ptma_indexed: 172,
        collective_scopus_docs: 25430,
        collective_garuda_docs: 84120,
        collective_ipr_count: 5120,
        top_university_overall: {
            id: 1,
            name: 'Universitas Muhammadiyah Surakarta',
            short_name: 'UMS',
            city: 'Surakarta',
            province: 'Jawa Tengah',
            accreditation_status: 'Unggul',
        },
        top_university_score: 345678,
    };

    it('renders spotlight #1 PTMA university details and formatted score', () => {
        render(<PtmaHeroBento stats={mockStats} />);

        expect(screen.getByText('Universitas Muhammadiyah Surakarta')).toBeInTheDocument();
        expect(screen.getByText('Surakarta')).toBeInTheDocument();
        expect(screen.getByText('Peringkat #1')).toBeInTheDocument();
        expect(screen.getByText('Akreditasi Unggul')).toBeInTheDocument();
        // 345.678 in ID locale
        expect(screen.getByText('345.678')).toBeInTheDocument();
    });

    it('renders the 4 macro metric cards with formatted numbers', () => {
        render(<PtmaHeroBento stats={mockStats} />);

        expect(screen.getByText('Total PTMA Terindeks')).toBeInTheDocument();
        expect(screen.getByText('172')).toBeInTheDocument();

        expect(screen.getByText('Publikasi Scopus Kolektif')).toBeInTheDocument();
        expect(screen.getByText('25.430')).toBeInTheDocument();

        expect(screen.getByText('Publikasi Garuda Kolektif')).toBeInTheDocument();
        expect(screen.getByText('84.120')).toBeInTheDocument();

        expect(screen.getByText('Paten & HKI Kolektif')).toBeInTheDocument();
        expect(screen.getByText('5.120')).toBeInTheDocument();
    });

    it('handles fallback gracefully when top university is not available', () => {
        const emptyStats: PtmaHeroStats = {
            total_ptma_indexed: 0,
            collective_scopus_docs: 0,
            collective_garuda_docs: 0,
            collective_ipr_count: 0,
            top_university_overall: null,
            top_university_score: 0,
        };

        render(<PtmaHeroBento stats={emptyStats} />);
        expect(screen.getByText('Universitas Muhammadiyah')).toBeInTheDocument();
        expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    });
});

describe('VariableSegmentedNav Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all 8 metric segmented nav pill items', () => {
        render(<VariableSegmentedNav currentSort="sinta_overall" filters={{}} />);

        expect(screen.getByText('Skor SINTA Overall')).toBeInTheDocument();
        expect(screen.getByText('Skor 3 Tahun')).toBeInTheDocument();
        expect(screen.getByText('Scopus')).toBeInTheDocument();
        expect(screen.getByText('Garuda')).toBeInTheDocument();
        expect(screen.getByText('WoS')).toBeInTheDocument();
        expect(screen.getByText('Paten / HKI')).toBeInTheDocument();
        expect(screen.getByText('Penelitian')).toBeInTheDocument();
        expect(screen.getByText('Pengabdian')).toBeInTheDocument();
    });

    it('renders active pill indicator on current active item', () => {
        render(<VariableSegmentedNav currentSort="scopus" filters={{}} />);
        expect(screen.getByTestId('activePillIndicator')).toBeInTheDocument();
    });

    it('calls router.get with correct sort key when clicking another tab', () => {
        render(<VariableSegmentedNav currentSort="sinta_overall" filters={{ q: 'muhammadiyah' }} />);

        fireEvent.click(screen.getByText('Scopus'));

        expect(mockRouterGet).toHaveBeenCalledWith(
            '/ptma/ranking',
            { q: 'muhammadiyah', sort: 'scopus', page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    });

    it('does not re-navigate when clicking currently active tab', () => {
        render(<VariableSegmentedNav currentSort="sinta_overall" filters={{}} />);

        fireEvent.click(screen.getByText('Skor SINTA Overall'));
        expect(mockRouterGet).not.toHaveBeenCalled();
    });
});

describe('FilterControlBar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    it('renders search input and BAN-PT accreditation dropdown', () => {
        render(<FilterControlBar filters={{ q: 'Yogyakarta', accreditation: 'Unggul' }} />);

        const input = screen.getByPlaceholderText(/Cari nama atau singkatan/i);
        expect(input).toHaveValue('Yogyakarta');

        const trigger = screen.getByLabelText(/Filter status akreditasi BAN-PT/i);
        expect(trigger).toHaveTextContent('Akreditasi: Unggul');
    });

    it('triggers debounced search on input change', () => {
        render(<FilterControlBar filters={{ sort: 'sinta_overall' }} />);

        const input = screen.getByPlaceholderText(/Cari nama atau singkatan/i);
        fireEvent.change(input, { target: { value: 'Surakarta' } });

        expect(mockRouterGet).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(400);
        });

        expect(mockRouterGet).toHaveBeenCalledWith(
            '/ptma/ranking',
            { sort: 'sinta_overall', q: 'Surakarta', page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    });

    it('triggers immediate search on form submit', () => {
        render(<FilterControlBar filters={{ sort: 'scopus' }} />);

        const input = screen.getByPlaceholderText(/Cari nama atau singkatan/i);
        fireEvent.change(input, { target: { value: 'Malang' } });

        const form = input.closest('form');
        fireEvent.submit(form!);

        expect(mockRouterGet).toHaveBeenCalledWith(
            '/ptma/ranking',
            { sort: 'scopus', q: 'Malang', page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    });

    it('triggers navigation when accreditation dropdown option is selected', () => {
        vi.useRealTimers();
        render(<FilterControlBar filters={{ sort: 'sinta_overall' }} />);

        const trigger = screen.getByLabelText(/Filter status akreditasi BAN-PT/i);
        fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });

        const option = screen.getByText('Baik Sekali');
        fireEvent.click(option);

        expect(mockRouterGet).toHaveBeenCalledWith(
            '/ptma/ranking',
            { sort: 'sinta_overall', accreditation: 'Baik Sekali', page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    });

    it('clears search when clear button is clicked', () => {
        render(<FilterControlBar filters={{ q: 'Jakarta', sort: 'sinta_overall' }} />);

        const clearBtn = screen.getByLabelText(/Bersihkan pencarian/i);
        fireEvent.click(clearBtn);

        expect(mockRouterGet).toHaveBeenCalledWith(
            '/ptma/ranking',
            { sort: 'sinta_overall', page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    });
});
