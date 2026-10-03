import React, { useEffect, useState } from 'react';
import {
    Award,
    BookOpen,
    Check,
    Copy,
    FileCheck,
    FileText,
    FlaskConical,
    GraduationCap,
    Handshake,
    Layers,
    Library,
    Quote,
    X,
} from 'lucide-react';
import { PtmaMetric } from '../types';

export interface PtmaDetailDrawerProps {
    metric: PtmaMetric | null;
    onClose: () => void;
}

export const PtmaDetailDrawer: React.FC<PtmaDetailDrawerProps> = ({ metric, onClose }) => {
    const [copied, setCopied] = useState(false);

    // ESC key listener & body scroll lock
    useEffect(() => {
        if (!metric) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [metric, onClose]);

    if (!metric) return null;

    const univ = metric.university;
    const numberFormatter = new Intl.NumberFormat('id-ID');

    const handleCopyLink = () => {
        const campusKey = encodeURIComponent(univ?.code || univ?.id || '');
        let url = window.location.href;
        if (url.includes('campus=')) {
            url = url.replace(/campus=[^&]*/, `campus=${campusKey}`);
        } else {
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}campus=${campusKey}`;
        }
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden font-['Geist',sans-serif]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-foreground/50 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-over panel container */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                <div className="w-screen max-w-lg bg-card text-card-foreground border-l border-border shadow-2xl flex flex-col justify-between overflow-y-auto">
                    {/* Header */}
                    <div className="p-6 border-b border-border sticky top-0 bg-card/95 backdrop-blur-md z-10">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary ring-1 ring-primary/25">
                                    Scorecard Kampus
                                </span>
                                <span className="font-mono text-xs text-muted-foreground font-medium">
                                    PTMA Rank #{metric.ranking_position}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                aria-label="Tutup panel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* University Profile Info */}
                        <div className="mt-5 flex items-start gap-3.5">
                            {univ.logo_url ? (
                                <img
                                    src={univ.logo_url}
                                    alt={univ.name}
                                    className="w-12 h-12 rounded-xl object-contain bg-muted p-1 ring-1 ring-border shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                                    {univ.short_name || univ.code || (univ.name ? univ.name.substring(0, 3).toUpperCase() : 'PTM')}
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <h3
                                    id="drawer-title"
                                    className="text-lg font-bold text-card-foreground leading-snug"
                                >
                                    {univ.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                                    {univ.code && <span className="font-mono font-medium">{univ.code}</span>}
                                    {univ.code && <span>•</span>}
                                    <span>{univ.city ?? 'Indonesia'}</span>
                                    {univ.province && <span>({univ.province})</span>}
                                </p>

                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {univ.accreditation_status && (
                                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md ring-1 ring-primary/25">
                                            BAN-PT: {univ.accreditation_status}
                                        </span>
                                    )}
                                    {metric.national_rank_overall && (
                                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                            Nasional: #{metric.national_rank_overall}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bento Scorecard Grid (2-Column) */}
                    <div className="p-6 space-y-5 flex-1">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                            Rincian Metrik & Luaran SINTA
                        </div>

                        {/* 1. Skor SINTA Overall & 3-Tahun */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-primary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">SINTA Overall</span>
                                    <Layers className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(Math.round(Number(metric.sinta_score_overall)))}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Semua Tahun</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-primary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">SINTA 3 Tahun</span>
                                    <Layers className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(Math.round(Number(metric.sinta_score_3yr)))}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">3 Tahun Terakhir</span>
                            </div>
                        </div>

                        {/* 2. Scopus Docs & Citations */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-primary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Scopus Dokumen</span>
                                    <BookOpen className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.scopus_docs)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Dokumen Terindeks</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-primary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Sitasi Scopus</span>
                                    <Quote className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.scopus_citations ?? 0)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Total Kutipan</span>
                            </div>
                        </div>

                        {/* 3. Garuda Docs & Citations */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-secondary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Garuda Dokumen</span>
                                    <FileCheck className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.garuda_docs)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Terakreditasi Nasional</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-secondary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Sitasi Garuda</span>
                                    <Quote className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.garuda_citations ?? 0)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Kutipan Garuda</span>
                            </div>
                        </div>

                        {/* 4. WoS Docs & Citations */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-primary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">WoS Dokumen</span>
                                    <FileText className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.wos_docs)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Web of Science</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-primary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Sitasi WoS</span>
                                    <Quote className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.wos_citations ?? 0)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Kutipan WoS</span>
                            </div>
                        </div>

                        {/* 5. Paten / HKI & Buku */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-secondary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Paten / HKI</span>
                                    <Award className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.ipr_count)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Kekayaan Intelektual</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Buku Terbit</span>
                                    <Library className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.book_count ?? 0)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">ISBN & Monograf</span>
                            </div>
                        </div>

                        {/* 6. Penelitian (Riset) & Pengabdian (PkM) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-primary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Penelitian</span>
                                    <FlaskConical className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.research_count)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Judul Riset</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-secondary">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Pengabdian (PkM)</span>
                                    <Handshake className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.service_count)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Kegiatan Masyarakat</span>
                            </div>
                        </div>

                        {/* 7. Dosen Terdaftar & Jurnal Kampus */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Dosen Terdaftar</span>
                                    <GraduationCap className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.authors_count ?? 0)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Author SINTA</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-2xs">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-[11px] font-medium uppercase tracking-wider">Jurnal Kampus</span>
                                    <BookOpen className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xl font-bold font-['Geist_Mono',monospace] tabular-nums text-primary mt-2">
                                    {numberFormatter.format(metric.journals_count ?? 0)}
                                </div>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Jurnal Terbitan Kampus</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-border bg-card space-y-2 sticky bottom-0">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors shadow-2xs"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-primary" />
                                        <span>Tautan Disalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>Salin Tautan</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                            >
                                Tutup Rincian
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
