import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DoiPackageData, DoiSettingsData } from '@/types/doi';
import { ArrowRight, Building2, Check, FileSearch, Fingerprint, ShieldCheck, Sparkles } from 'lucide-react';

interface DoiEmptyStateProps {
    packages: DoiPackageData[];
    settings?: DoiSettingsData;
    onSelectPackage?: (pkg: DoiPackageData) => void;
    className?: string;
}

function formatRupiah(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

export function DoiEmptyState({ packages = [], onSelectPackage, className }: DoiEmptyStateProps) {
    return (
        <div className={cn('space-y-8', className)}>
            {/* Onboarding Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 shadow-xs sm:p-8">
                <div className="max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5" />
                        <span>Layanan Resmi Crossref & Similarity Check</span>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Mulai Langganan DOI untuk Perguruan Tinggi Anda</h2>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Institusi Anda belum memiliki langganan DOI Crossref aktif. Bergabunglah dengan konsorsium Majelis Diktilitbang PPM untuk
                        mendapatkan prefix resmi institusi, deposit DOI tanpa batas, dan alokasi kuota uji kesamaan (similarity check).
                    </p>
                </div>
            </div>

            {/* Available Packages Grid */}
            <div className="space-y-4">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-foreground">Pilihan Paket Berlangganan</h3>
                    <p className="text-xs text-muted-foreground">Pilih paket tahunan yang paling sesuai dengan kebutuhan jurnal di kampus Anda</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pkg) => {
                        const isFeatured = Boolean(pkg.is_featured);
                        const badgeText = pkg.badge_text || 'Rekomendasi';

                        return (
                            <Card
                                key={pkg.id}
                                className={cn(
                                    'relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-lg',
                                    isFeatured ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border/80',
                                )}
                            >
                                {isFeatured && (
                                    <div className="absolute top-0 right-0 rounded-bl-lg bg-primary px-3 py-1 text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
                                        {badgeText}
                                    </div>
                                )}

                                <CardHeader className="pb-4">
                                    <Badge variant="outline" className="mb-1 w-fit font-mono text-[10px]">
                                        {pkg.code}
                                    </Badge>
                                    <CardTitle className="text-xl font-bold text-foreground">{pkg.name}</CardTitle>
                                    <CardDescription className="min-h-[36px] text-xs">
                                        {pkg.description || 'Solusi pengelolaan DOI terintegrasi untuk jurnal kampus'}
                                    </CardDescription>

                                    <div className="pt-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-mono text-2xl font-extrabold text-foreground tabular-nums sm:text-3xl">
                                                {formatRupiah(pkg.price_annual)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">/ Tahun</span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pb-6">
                                    <div className="space-y-2 border-t pt-4 text-xs">
                                        {(pkg.features && pkg.features.length > 0
                                            ? pkg.features
                                            : [
                                                  'Prefix Crossref Resmi Kampus',
                                                  'Deposit Artikel Tanpa Batas',
                                                  `Kuota ${pkg.similarity_quota_included} Dokumen Uji Plagiasi`,
                                                  'Dukungan Teknis & Konsultasi',
                                              ]
                                        ).map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-foreground/90">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0">
                                    <Button
                                        type="button"
                                        onClick={() => onSelectPackage?.(pkg)}
                                        className={cn(
                                            'w-full gap-1.5 text-xs shadow-xs',
                                            isFeatured
                                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                                        )}
                                    >
                                        <span>Pilih & Ajukan Paket</span>
                                        <ArrowRight className="size-3.5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Why Subscribe / Info Highlights */}
            <div className="space-y-4 rounded-xl border bg-card p-6 shadow-2xs">
                <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <ShieldCheck className="size-4 text-primary" />
                    Keuntungan Konsorsium DOI Majelis Diktilitbang PPM
                </h4>

                <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
                    <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <Fingerprint className="size-4 text-primary" />
                            Prefix Mandiri
                        </div>
                        <p className="leading-relaxed text-muted-foreground">
                            Masing-masing kampus memiliki kode prefix unik Crossref tersendiri untuk menjamin kredibilitas dan identitas institusi.
                        </p>
                    </div>

                    <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <FileSearch className="size-4 text-emerald-600" />
                            iThenticate Similarity
                        </div>
                        <p className="leading-relaxed text-muted-foreground">
                            Dapatkan akses kuota resmi iThenticate untuk menjaga integritas naskah dan pencegahan plagiarisme karya ilmiah.
                        </p>
                    </div>

                    <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <Building2 className="size-4 text-amber-600" />
                            Biaya Kolektif Terjangkau
                        </div>
                        <p className="leading-relaxed text-muted-foreground">
                            Skema keanggotaan kolektif memberikan efisiensi biaya tahunan yang jauh lebih ekonomis dibandingkan berlangganan mandiri
                            ke Crossref USA.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
