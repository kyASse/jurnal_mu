import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PtmaDetailDrawer } from '../components/PtmaDetailDrawer';
import { PtmaMetric } from '../types';

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
            logo_url: 'https://example.com/ums-logo.png',
        },
    };

    describe('Rendering & Layout', () => {
        it('renders campus branding: name, short name / code, city, and province', () => {
            render(<PtmaDetailDrawer metric={mockMetric} onClose={vi.fn()} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Universitas Muhammadiyah Surakarta')).toBeInTheDocument();
            expect(screen.getByText('UMS')).toBeInTheDocument();
            expect(screen.getByText('Surakarta')).toBeInTheDocument();
            expect(screen.getByText('(Jawa Tengah)')).toBeInTheDocument();

            // Logo image rendering
            const logo = screen.getByRole('img', { name: 'Universitas Muhammadiyah Surakarta' });
            expect(logo).toHaveAttribute('src', 'https://example.com/ums-logo.png');
        });

        it('renders fallback initials when logo_url is absent', () => {
            const metricWithoutLogo: PtmaMetric = {
                ...mockMetric,
                university: {
                    ...mockMetric.university,
                    logo_url: null,
                    short_name: 'UMS',
                },
            };

            render(<PtmaDetailDrawer metric={metricWithoutLogo} onClose={vi.fn()} />);
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
            // Both avatar initials and subtitle code show UMS
            expect(screen.getAllByText('UMS').length).toBeGreaterThanOrEqual(2);
        });

        it('renders BAN-PT accreditation pill, national rank pill, and PTMA rank', () => {
            render(<PtmaDetailDrawer metric={mockMetric} onClose={vi.fn()} />);

            expect(screen.getByText('BAN-PT: Unggul')).toBeInTheDocument();
            expect(screen.getByText('Nasional: #12')).toBeInTheDocument();
            expect(screen.getByText('PTMA: #1')).toBeInTheDocument();
            expect(screen.getByText('PTMA Rank #1')).toBeInTheDocument();
        });

        it('renders SINTA overall and 3-year scorecards formatted in id-ID locale', () => {
            render(<PtmaDetailDrawer metric={mockMetric} onClose={vi.fn()} />);

            expect(screen.getByText('Skor SINTA Kemdikbudristek')).toBeInTheDocument();
            expect(screen.getByText('SINTA Overall')).toBeInTheDocument();
            // 345.678 in id-ID format
            expect(screen.getByText('345.678')).toBeInTheDocument();
            expect(screen.getByText('Akumulasi Semua Tahun')).toBeInTheDocument();

            expect(screen.getByText('SINTA 3 Tahun')).toBeInTheDocument();
            // 123.456 in id-ID format
            expect(screen.getByText('123.456')).toBeInTheDocument();
            expect(screen.getByText('3 Tahun Terakhir')).toBeInTheDocument();
        });

        it('renders Sidik Jari Riset & Luaran radar chart card and its 6 dimensions', () => {
            render(<PtmaDetailDrawer metric={mockMetric} onClose={vi.fn()} />);

            expect(screen.getByText('Sidik Jari Riset & Luaran')).toBeInTheDocument();
            expect(
                screen.getByText(/Profil kekuatan luaran riset dan publikasi kampus pada 6 dimensi utama/i)
            ).toBeInTheDocument();
            expect(screen.getByText('6 Sumbu')).toBeInTheDocument();

            // Radar axes labels
            expect(screen.getByText('Scopus')).toBeInTheDocument();
            expect(screen.getByText('Garuda')).toBeInTheDocument();
            expect(screen.getByText('WoS')).toBeInTheDocument();
            expect(screen.getByText('HKI')).toBeInTheDocument();
            expect(screen.getByText('Riset')).toBeInTheDocument();
            expect(screen.getByText('Pengabdian')).toBeInTheDocument();
        });

        it('renders the 3 thematic bento modules and their metrics formatted in id-ID locale', () => {
            render(<PtmaDetailDrawer metric={mockMetric} onClose={vi.fn()} />);

            expect(screen.getByText('Rincian Klaster Luaran SINTA')).toBeInTheDocument();

            // Module 1: Publikasi & Sitasi Global (Scopus, WoS)
            expect(screen.getByText('Publikasi & Sitasi Global')).toBeInTheDocument();
            expect(screen.getByText('Scopus • WoS')).toBeInTheDocument();
            expect(screen.getByText('Scopus Dokumen')).toBeInTheDocument();
            expect(screen.getByText('1.450')).toBeInTheDocument();
            expect(screen.getByText('Sitasi Scopus')).toBeInTheDocument();
            expect(screen.getByText('5.600')).toBeInTheDocument();
            expect(screen.getByText('WoS Dokumen')).toBeInTheDocument();
            expect(screen.getByText('420')).toBeInTheDocument();
            expect(screen.getByText('Sitasi WoS')).toBeInTheDocument();
            expect(screen.getByText('1.200')).toBeInTheDocument();

            // Module 2: Publikasi Nasional & HKI (Garuda, Paten/HKI, Buku)
            expect(screen.getByText('Publikasi Nasional & HKI')).toBeInTheDocument();
            expect(screen.getByText('Garuda • Paten • Buku')).toBeInTheDocument();
            expect(screen.getByText('Garuda Dokumen')).toBeInTheDocument();
            expect(screen.getByText('3.200')).toBeInTheDocument();
            expect(screen.getByText('Sitasi Garuda')).toBeInTheDocument();
            expect(screen.getByText('4.500')).toBeInTheDocument();
            expect(screen.getByText('Paten / HKI')).toBeInTheDocument();
            expect(screen.getByText('310')).toBeInTheDocument();
            expect(screen.getByText('Buku Terbit')).toBeInTheDocument();
            expect(screen.getByText('150')).toBeInTheDocument();

            // Module 3: Produktivitas Riset & Sumber Daya Akademik (Penelitian, Pengabdian, Dosen, Jurnal)
            expect(screen.getByText('Produktivitas Riset & Akademik')).toBeInTheDocument();
            expect(screen.getByText('Riset • PkM • SDM')).toBeInTheDocument();
            expect(screen.getByText('Penelitian')).toBeInTheDocument();
            expect(screen.getByText('520')).toBeInTheDocument();
            expect(screen.getByText('Pengabdian (PkM)')).toBeInTheDocument();
            expect(screen.getByText('280')).toBeInTheDocument();
            expect(screen.getByText('Dosen Terdaftar')).toBeInTheDocument();
            expect(screen.getByText('850')).toBeInTheDocument();
            expect(screen.getByText('Jurnal Kampus')).toBeInTheDocument();
            expect(screen.getByText('18')).toBeInTheDocument();
        });
    });

    describe('Interactive Behaviors', () => {
        let originalClipboard: Clipboard;
        let writeTextMock: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            writeTextMock = vi.fn().mockResolvedValue(undefined);
            originalClipboard = navigator.clipboard;
            Object.defineProperty(navigator, 'clipboard', {
                value: { writeText: writeTextMock },
                writable: true,
                configurable: true,
            });
        });

        afterEach(() => {
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                writable: true,
                configurable: true,
            });
            vi.useRealTimers();
        });

        it('copies campus link to clipboard with campus query param when Salin Tautan is clicked and displays temporary feedback', async () => {
            vi.useFakeTimers();

            render(<PtmaDetailDrawer metric={mockMetric} onClose={vi.fn()} />);

            const copyBtn = screen.getByRole('button', { name: /salin tautan/i });
            expect(copyBtn).toBeInTheDocument();

            await act(async () => {
                fireEvent.click(copyBtn);
            });

            expect(writeTextMock).toHaveBeenCalledTimes(1);
            const copiedUrl = writeTextMock.mock.calls[0][0];
            expect(copiedUrl).toContain('campus=UMS');

            // Feedback visible
            expect(screen.getByText('Tautan Disalin')).toBeInTheDocument();

            // Advance timers by 2000ms
            act(() => {
                vi.advanceTimersByTime(2000);
            });

            // Resets back
            expect(screen.getByText('Salin Tautan')).toBeInTheDocument();
        });

        it('calls onClose when Tutup Rincian footer button is clicked', () => {
            const onClose = vi.fn();
            render(<PtmaDetailDrawer metric={mockMetric} onClose={onClose} />);

            const closeFooterBtn = screen.getByRole('button', { name: /tutup rincian/i });
            fireEvent.click(closeFooterBtn);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when header X button is clicked', () => {
            const onClose = vi.fn();
            render(<PtmaDetailDrawer metric={mockMetric} onClose={onClose} />);

            const closeHeaderBtn = screen.getByLabelText('Tutup panel');
            fireEvent.click(closeHeaderBtn);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when backdrop is clicked', () => {
            const onClose = vi.fn();
            const { container } = render(<PtmaDetailDrawer metric={mockMetric} onClose={onClose} />);

            // Backdrop has aria-hidden="true"
            const backdrop = container.querySelector('[aria-hidden="true"]');
            expect(backdrop).not.toBeNull();
            fireEvent.click(backdrop!);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when Escape key is pressed', () => {
            const onClose = vi.fn();
            render(<PtmaDetailDrawer metric={mockMetric} onClose={onClose} />);

            fireEvent.keyDown(window, { key: 'Escape' });
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('locks body overflow on mount and restores on unmount', () => {
            document.body.style.overflow = 'visible';

            const { unmount } = render(<PtmaDetailDrawer metric={mockMetric} onClose={vi.fn()} />);
            expect(document.body.style.overflow).toBe('hidden');

            unmount();
            expect(document.body.style.overflow).toBe('visible');
        });
    });

    describe('Defensive / Null Handling', () => {
        it('returns null when metric is null', () => {
            const { container } = render(<PtmaDetailDrawer metric={null} onClose={vi.fn()} />);
            expect(container.firstChild).toBeNull();
        });

        it('handles optional metric and university fields being null/undefined gracefully', () => {
            const minimalMetric: PtmaMetric = {
                id: 99,
                ranking_position: 10,
                sinta_score_overall: 12000,
                sinta_score_3yr: 4000,
                scopus_docs: 0,
                garuda_docs: 0,
                wos_docs: 0,
                ipr_count: 0,
                research_count: 0,
                service_count: 0,
                university: {
                    id: 99,
                    name: 'Universitas Tanpa Profil Lengkap',
                },
            };

            const { container } = render(
                <PtmaDetailDrawer metric={minimalMetric} onClose={vi.fn()} />
            );

            expect(container.firstChild).not.toBeNull();
            expect(screen.getByText('Universitas Tanpa Profil Lengkap')).toBeInTheDocument();
            expect(screen.getByText('PTMA Rank #10')).toBeInTheDocument();
            expect(screen.getByText('Indonesia')).toBeInTheDocument();
            // Accreditation & national rank pills should not appear
            expect(screen.queryByText(/BAN-PT:/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Nasional: #/i)).not.toBeInTheDocument();
        });
    });
});
