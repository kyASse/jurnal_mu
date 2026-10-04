import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PtmaStatisticsChart } from '../components/PtmaStatisticsChart';
import { PtmaMetric } from '../types';

describe('PtmaStatisticsChart Component', () => {
    const mockMetrics: PtmaMetric[] = [
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
                code: 'UMS',
            },
        },
        {
            id: 2,
            ranking_position: 2,
            sinta_score_overall: 298765,
            sinta_score_3yr: 110980,
            scopus_docs: 1200,
            garuda_docs: 2800,
            wos_docs: 380,
            ipr_count: 290,
            research_count: 480,
            service_count: 250,
            university: {
                id: 20,
                name: 'Universitas Ahmad Dahlan',
                short_name: 'UAD',
                code: 'UAD',
            },
        },
        {
            id: 3,
            ranking_position: 3,
            sinta_score_overall: 265432,
            sinta_score_3yr: 95430,
            scopus_docs: 1050,
            garuda_docs: 2400,
            wos_docs: 310,
            ipr_count: 240,
            research_count: 410,
            service_count: 210,
            university: {
                id: 30,
                name: 'Universitas Muhammadiyah Yogyakarta',
                short_name: 'UMY',
                code: 'UMY',
            },
        },
        {
            id: 4,
            ranking_position: 4,
            sinta_score_overall: 210987,
            sinta_score_3yr: 82000,
            scopus_docs: 900,
            garuda_docs: 2100,
            wos_docs: 250,
            ipr_count: 190,
            research_count: 350,
            service_count: 180,
            university: {
                id: 40,
                name: 'Universitas Muhammadiyah Malang',
                short_name: 'UMM',
                code: 'UMM',
            },
        },
    ];

    it('returns null when metrics is empty or undefined', () => {
        const { container: emptyContainer } = render(<PtmaStatisticsChart metrics={[]} />);
        expect(emptyContainer.firstChild).toBeNull();

        const { container: undefContainer } = render(
            <PtmaStatisticsChart metrics={undefined as any} />
        );
        expect(undefContainer.firstChild).toBeNull();
    });

    it('renders container with title, subtitle, and tabs', () => {
        render(<PtmaStatisticsChart metrics={mockMetrics} currentSort="sinta_overall" />);

        expect(screen.getByText('Statistik & Komparasi PTMA')).toBeInTheDocument();
        expect(
            screen.getByText(/Benchmark 10 besar berdasarkan metrik terpilih/i)
        ).toBeInTheDocument();

        expect(screen.getByRole('tab', { name: /Top 10 Benchmark/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Profil Riset Top 3/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sembunyikan Grafik/i })).toBeInTheDocument();
    });

    it('collapses and expands content when toggle button is clicked', () => {
        render(<PtmaStatisticsChart metrics={mockMetrics} currentSort="sinta_overall" />);

        const toggleBtn = screen.getByRole('button', { name: /Sembunyikan Grafik/i });
        expect(screen.getByRole('tablist')).toBeInTheDocument();

        // Click to collapse
        fireEvent.click(toggleBtn);
        expect(screen.getByRole('button', { name: /Tampilkan Grafik/i })).toBeInTheDocument();
        expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

        // Click to expand again
        const expandBtn = screen.getByRole('button', { name: /Tampilkan Grafik/i });
        fireEvent.click(expandBtn);
        expect(screen.getByRole('button', { name: /Sembunyikan Grafik/i })).toBeInTheDocument();
        expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('switches between Bar and Radar tabs', () => {
        render(<PtmaStatisticsChart metrics={mockMetrics} currentSort="sinta_overall" />);

        const barTab = screen.getByRole('tab', { name: /Top 10 Benchmark/i });
        const radarTab = screen.getByRole('tab', { name: /Profil Riset Top 3/i });

        expect(barTab).toHaveAttribute('data-state', 'active');
        expect(radarTab).toHaveAttribute('data-state', 'inactive');

        // Switch to radar tab
        fireEvent.click(radarTab);
        expect(radarTab).toHaveAttribute('data-state', 'active');
        expect(barTab).toHaveAttribute('data-state', 'inactive');

        // Switch back to bar tab
        fireEvent.click(barTab);
        expect(barTab).toHaveAttribute('data-state', 'active');
        expect(radarTab).toHaveAttribute('data-state', 'inactive');
    });

    it('renders radar chart tab content with Top 3 university information', () => {
        render(<PtmaStatisticsChart metrics={mockMetrics} currentSort="sinta_overall" />);

        const radarTab = screen.getByRole('tab', { name: /Profil Riset Top 3/i });
        fireEvent.click(radarTab);

        // Subtitle / note in radar tab
        expect(screen.getByText(/Perbandingan proporsional 6 sumbu riset/i)).toBeInTheDocument();
    });

    it('handles custom currentSort smoothly', () => {
        const { rerender } = render(
            <PtmaStatisticsChart metrics={mockMetrics} currentSort="scopus" />
        );
        expect(screen.getAllByText(/Scopus/i).length).toBeGreaterThanOrEqual(1);

        rerender(<PtmaStatisticsChart metrics={mockMetrics} currentSort="garuda" />);
        expect(screen.getAllByText(/Garuda/i).length).toBeGreaterThanOrEqual(1);
    });
});
