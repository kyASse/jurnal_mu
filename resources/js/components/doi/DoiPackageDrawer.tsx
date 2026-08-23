import * as React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DoiPackageData, DoiSettingsData, DoiSubscriptionData } from '@/types/doi';
import {
    Layers,
    CheckCircle2,
    Mail,
    HelpCircle,
    FileSearch,
    Fingerprint,
    Building2,
    Calendar,
    Shield,
    ExternalLink,
    PhoneCall,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';

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

    const benefits = (currentPackage?.features && currentPackage.features.length > 0)
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
            }
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-6">
                <SheetHeader className="p-0 text-left space-y-2 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Layers className="size-4" />
                        </div>
                        <div>
                            <SheetTitle className="text-lg font-bold text-foreground">
                                Rincian Paket Langganan
                            </SheetTitle>
                            <SheetDescription className="text-xs">
                                Manfaat, spesifikasi, dan saluran bantuan teknis
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 py-4">
                    {/* Package Overview Card */}
                    <div className="rounded-xl border bg-muted/40 p-4 space-y-3 dark:bg-muted/10">
                        <div className="flex items-start justify-between">
                            <div>
                                <Badge variant="outline" className="text-[10px] font-mono mb-1">
                                    {packageCode}
                                </Badge>
                                <h4 className="text-base font-bold text-foreground">
                                    {packageName}
                                </h4>
                            </div>
                            <Badge className="bg-primary/90 text-primary-foreground text-xs font-semibold">
                                {formatRupiah(priceAnnual)} <span className="text-[10px] font-normal opacity-80">/ Thn</span>
                            </Badge>
                        </div>

                        {currentPackage?.description && (
                            <p className="text-xs text-muted-foreground">
                                {currentPackage.description}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                            <div className="space-y-0.5">
                                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                                    <Fingerprint className="size-3" />
                                    Prefix Institusi
                                </span>
                                <p className="font-mono font-semibold text-foreground">
                                    {subscription?.active_prefix || 'Tersedia'}
                                </p>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                                    <FileSearch className="size-3" />
                                    Kuota Plagiasi
                                </span>
                                <p className="font-mono font-semibold text-foreground">
                                    {quota} Dokumen
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Period Info */}
                    {subscription && (
                        <div className="rounded-lg border border-border/80 p-3 space-y-1.5 text-xs">
                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
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
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Shield className="size-3.5 text-primary" />
                            Fasilitas & Keuntungan Paket
                        </h5>

                        <ul className="space-y-2 text-xs">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2 text-foreground/90">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help & Support Contact Section */}
                    <div className="rounded-xl border border-dashed border-border bg-background p-4 space-y-3">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                            <HelpCircle className="size-4" />
                            <span>Butuh Bantuan atau Kustomisasi Paket?</span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {settings?.doi_helpdesk_notes || 'Hubungi Tim Layanan Jurnal & DOI Majelis Diktilitbang Pimpinan Pusat Muhammadiyah jika institusi Anda memerlukan penyesuaian khusus atau mengalami kendala deposit DOI.'}
                        </p>

                        <div className="space-y-2 pt-1">
                            <a
                                href={`mailto:${settings?.doi_helpdesk_email || 'jurnal@diktilitbangmuhammadiyah.org'}`}
                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Mail className="size-3.5" />
                                <span>{settings?.doi_helpdesk_email || 'jurnal@diktilitbangmuhammadiyah.org'}</span>
                            </a>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <PhoneCall className="size-3.5" />
                                <span>Hotline: {settings?.doi_helpdesk_phone || '+62 812-3456-7890'} ({settings?.doi_helpdesk_hours || 'Hari Kerja, 08:00 - 16:00 WIB'})</span>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="p-0 pt-4 border-t flex flex-col gap-3 sm:flex-col">
                    {currentPackage && (
                        <div className="flex items-center justify-between rounded-lg bg-muted/60 p-3 text-xs border border-border/80">
                            <span className="text-muted-foreground font-medium">Total Biaya Tahunan:</span>
                            <div className="flex items-baseline gap-1">
                                <span className="font-mono font-bold text-sm text-foreground">
                                    {formatRupiah(priceAnnual)}
                                </span>
                                <span className="text-[11px] font-normal text-muted-foreground">/ Thn</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        {currentPackage && (
                            <Button
                                type="button"
                                className="w-full sm:flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs font-semibold"
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
                            className={cn("w-full", currentPackage ? "sm:w-auto" : "w-full")}
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
