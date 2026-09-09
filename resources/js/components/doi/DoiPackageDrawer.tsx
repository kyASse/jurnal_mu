import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { DoiPackageData, DoiSettingsData, DoiSubscriptionData } from '@/types/doi';
import { router } from '@inertiajs/react';
import { Calendar, CheckCircle2, FileSearch, Fingerprint, HelpCircle, Layers, Loader2, Mail, PhoneCall, Shield, Sparkles } from 'lucide-react';
import * as React from 'react';

interface DoiPackageDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription: DoiSubscriptionData | null;
    packageData?: DoiPackageData | null;
    settings?: DoiSettingsData;
    onSubscribe?: (pkg: DoiPackageData) => void;
    isSubmitting?: boolean;
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

function formatDateIndo(dateStr?: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function DoiPackageDrawer({
    open,
    onOpenChange,
    subscription,
    packageData,
    settings,
    onSubscribe,
    isSubmitting: externalIsSubmitting,
}: DoiPackageDrawerProps) {
    const [internalSubmitting, setInternalSubmitting] = React.useState(false);
    const isSubmitting = externalIsSubmitting ?? internalSubmitting;

    const currentPackage = packageData || subscription?.package;
    const packageName = currentPackage?.name || 'Paket Langganan Crossref';
    const packageCode = currentPackage?.code || 'PKG-DOI';
    const priceAnnual = currentPackage?.price_annual || 0;
    const quota = currentPackage?.similarity_quota_included ?? subscription?.similarity_quota_total ?? 0;

    const benefits =
        currentPackage?.features && currentPackage.features.length > 0
            ? currentPackage.features
            : [
                  'Prefix Resmi Crossref Atas Nama Institusi',
                  'Deposit DOI Tanpa Batas (Unlimited) untuk Seluruh Jurnal Terdaftar',
                  `Alokasi Kuota Uji Plagiasi (${quota} Dokumen / Periode)`,
                  'Integrasi Metadata Otomatis Melalui OAI-PMH',
                  'Laporan Statistik & Dashboard Sentralisasi Kampus',
                  'Dukungan Teknis Prioritas Majelis Diktilitbang PPM',
                  'Pemeliharaan Tahunan & Notifikasi Masa Berakhir Otomatis',
              ];

    const handleConfirmSubscribe = () => {
        if (!currentPackage) return;
        if (onSubscribe) {
            onSubscribe(currentPackage);
            return;
        }

        router.post(
            route('admin-kampus.doi.subscribe'),
            { package_id: currentPackage.id },
            {
                onStart: () => setInternalSubmitting(true),
                onFinish: () => setInternalSubmitting(false),
                onSuccess: () => {
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full overflow-y-auto p-6 sm:max-w-md">
                <SheetHeader className="space-y-2 border-b p-0 pb-4 text-left">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Layers className="size-4" />
                        </div>
                        <div>
                            <SheetTitle className="text-lg font-bold text-foreground">Rincian Paket Langganan</SheetTitle>
                            <SheetDescription className="text-xs">Manfaat, spesifikasi, dan saluran bantuan teknis</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 py-4">
                    {/* Package Overview Card */}
                    <div className="space-y-3 rounded-xl border bg-muted/40 p-4 dark:bg-muted/10">
                        <div className="flex items-start justify-between">
                            <div>
                                <Badge variant="outline" className="mb-1 font-mono text-[10px]">
                                    {packageCode}
                                </Badge>
                                <h4 className="text-base font-bold text-foreground">{packageName}</h4>
                            </div>
                            <Badge className="bg-primary/90 text-xs font-semibold text-primary-foreground">
                                {formatRupiah(priceAnnual)} <span className="text-[10px] font-normal opacity-80">/ Thn</span>
                            </Badge>
                        </div>

                        {currentPackage?.description && <p className="text-xs text-muted-foreground">{currentPackage.description}</p>}

                        <div className="grid grid-cols-2 gap-2 border-t pt-2 text-xs">
                            <div className="space-y-0.5">
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Fingerprint className="size-3" />
                                    Prefix Institusi
                                </span>
                                <p className="font-mono font-semibold text-foreground">{subscription?.active_prefix || 'Tersedia'}</p>
                            </div>

                            <div className="space-y-0.5">
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <FileSearch className="size-3" />
                                    Kuota Plagiasi
                                </span>
                                <p className="font-mono font-semibold text-foreground">{quota} Dokumen</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Period Info */}
                    {subscription && (
                        <div className="space-y-1.5 rounded-lg border border-border/80 p-3 text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                                <Calendar className="size-3.5" />
                                Masa Periode Berjalan
                            </span>
                            <p className="font-semibold text-foreground">
                                {formatDateIndo(subscription.start_date)} — {formatDateIndo(subscription.end_date)}
                            </p>
                        </div>
                    )}

                    {/* Feature & Benefits Checklist */}
                    <div className="space-y-3">
                        <h5 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <Shield className="size-3.5 text-primary" />
                            Fasilitas & Keuntungan Paket
                        </h5>

                        <ul className="space-y-2 text-xs">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2 text-foreground/90">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help & Support Contact Section */}
                    <div className="space-y-3 rounded-xl border border-dashed border-border bg-background p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                            <HelpCircle className="size-4" />
                            <span>Butuh Bantuan atau Kustomisasi Paket?</span>
                        </div>

                        <p className="text-xs leading-relaxed text-muted-foreground">
                            {settings?.doi_helpdesk_notes ||
                                'Hubungi Tim Layanan Jurnal & DOI Majelis Diktilitbang Pimpinan Pusat Muhammadiyah jika institusi Anda memerlukan penyesuaian khusus atau mengalami kendala deposit DOI.'}
                        </p>

                        <div className="space-y-2 pt-1">
                            <a
                                href={`mailto:${settings?.doi_helpdesk_email || 'jurnal@diktilitbangmuhammadiyah.org'}`}
                                className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary"
                            >
                                <Mail className="size-3.5" />
                                <span>{settings?.doi_helpdesk_email || 'jurnal@diktilitbangmuhammadiyah.org'}</span>
                            </a>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <PhoneCall className="size-3.5" />
                                <span>
                                    Hotline: {settings?.doi_helpdesk_phone || '+62 812-3456-7890'} (
                                    {settings?.doi_helpdesk_hours || 'Hari Kerja, 08:00 - 16:00 WIB'})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="flex flex-col gap-3 border-t p-0 pt-4 sm:flex-col">
                    {currentPackage && (
                        <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/60 p-3 text-xs">
                            <span className="font-medium text-muted-foreground">Total Biaya Tahunan:</span>
                            <div className="flex items-baseline gap-1">
                                <span className="font-mono text-sm font-bold text-foreground">{formatRupiah(priceAnnual)}</span>
                                <span className="text-[11px] font-normal text-muted-foreground">/ Thn</span>
                            </div>
                        </div>
                    )}

                    <div className="flex w-full flex-col gap-2 sm:flex-row">
                        {currentPackage && (
                            <Button
                                type="button"
                                className="w-full gap-2 bg-primary font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 sm:flex-1"
                                onClick={handleConfirmSubscribe}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-4" />
                                        <span>Konfirmasi & Ajukan Paket Ini</span>
                                    </>
                                )}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            className={cn('w-full', currentPackage ? 'sm:w-auto' : 'w-full')}
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Tutup
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
