import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import FeaturedJournalBento from '../featured-journal-bento';

beforeAll(() => {
    (globalThis as any).route = (name: string, _params?: any) => `/route/${name}`;
});

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('FeaturedJournalBento', () => {
    const mockJournals = [
        {
            id: 1,
            title: 'Jurnal Ilmiah Farmasi dan Biomedis',
            sinta_rank: 'S1',
            sinta_rank_label: 'SINTA 1',
            issn: '2085-1234',
            e_issn: '2548-5678',
            university: 'Universitas Muhammadiyah Surakarta',
            indexation_labels: ['Scopus', 'WoS', 'DOAJ'],
        },
        {
            id: 2,
            title: 'Jurnal Teknologi dan Rekayasa Sistem',
            sinta_rank: 'S2',
            sinta_rank_label: 'SINTA 2',
            issn: '2301-4433',
            e_issn: '2655-9988',
            university: 'Universitas Ahmad Dahlan',
            indexation_labels: ['DOAJ', 'Dimensions'],
        },
        {
            id: 3,
            title: 'Jurnal Pendidikan Islam Kontemporer',
            sinta_rank: 'S2',
            sinta_rank_label: 'SINTA 2',
            issn: '1978-2233',
            e_issn: '2502-8877',
            university: 'Universitas Muhammadiyah Yogyakarta',
            indexation_labels: ['DOAJ', 'Copernicus'],
        },
        {
            id: 4,
            title: 'Jurnal Kedokteran dan Kesehatan Nusantara',
            sinta_rank: 'S2',
            sinta_rank_label: 'SINTA 2',
            issn: '2089-9911',
            e_issn: '2598-1122',
            university: 'Universitas Muhammadiyah Jakarta',
            indexation_labels: ['SINTA', 'Garuda'],
        },
    ];

    it('renders master showcase card with nested CTA "Explore Publication" and satellite cards in English', () => {
        render(<FeaturedJournalBento journals={mockJournals} />);

        expect(screen.getByText(/Featured Journals/i)).toBeInTheDocument();
        expect(screen.getByText('Jurnal Ilmiah Farmasi dan Biomedis')).toBeInTheDocument();
        expect(screen.getByText('Explore Publication')).toBeInTheDocument();
        expect(screen.getByText('Jurnal Teknologi dan Rekayasa Sistem')).toBeInTheDocument();
        expect(screen.getByText(/View All Journals/i)).toBeInTheDocument();
    });
});
