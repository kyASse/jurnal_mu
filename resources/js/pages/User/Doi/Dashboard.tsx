import { DoiPackageDrawer, DoiPrefixCard, DoiQuotaGauge, DoiQuotaLogTable, DoiStatusHero } from '@/components/doi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { DoiActiveInvoiceData, DoiPackageData, DoiQuotaLogData, DoiSettingsData, DoiSubscriptionData } from '@/types/doi';
import { Head } from '@inertiajs/react';
import { AlertCircle, Building2, Globe, HelpCircle, Info, ShieldCheck } from 'lucide-react';
import * as React from 'react';

interface UserDoiDashboardProps {
    subscription: DoiSubscriptionData | null;
    activeInvoice?: DoiActiveInvoiceData | null;
    recentQuotaLogs: DoiQuotaLogData[];
    packages: DoiPackageData[];
    doiSettings?: DoiSettingsData;
    universityName: string;
    journalsCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Langganan DOI',
        href: route('user.doi-subscription.index'),
    },
];

export default function UserDoiDashboard({
    subscription,
    recentQuotaLogs = [],
    packages = [],
    doiSettings,
    universityName = 'Institusi',
    journalsCount = 0,
}: UserDoiDashboardProps) {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [selectedPackage, setSelectedPackage] = React.useState<DoiPackageData | null>(null);

    const handleOpenPackageDetail = (pkg?: DoiPackageData) => {
        if (pkg) {
            setSelectedPackage(pkg);
        } else {
            setSelectedPackage(subscription?.package ?? null);
        }
        setDrawerOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Informasi Langganan DOI & Kuota Plagiasi" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Layanan DOI & Similarity Check</h1>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="size-4 shrink-0 text-muted-foreground/70" />
                            <span>
                                Informasi prefix Crossref dan alokasi kuota pemeriksaan kemiripan artikel untuk{' '}
                                <strong className="font-semibold text-foreground">{universityName}</strong>
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenPackageDetail()} className="text-xs shadow-2xs">
                            <HelpCircle className="mr-1.5 size-3.5" />
                            Rincian Layanan
                        </Button>
                    </div>
                </div>

                {/* Centralized LPPM Management Callout */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 shadow-2xs dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                    <div className="flex items-start gap-3">
                        <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="space-y-1">
                            <p className="font-semibold text-blue-950 dark:text-blue-100">Pengelolaan Terpusat Institusi</p>
                            <p className="leading-relaxed">
                                Layanan DOI Crossref dan kuota Similarity Check (iThenticate) dikelola secara terpusat oleh LPPM / Administrator
                                Kampus ({universityName}). Seluruh jurnal terdaftar pada institusi Anda dapat memanfaatkan prefix resmi ini dan
                                berbagi alokasi kuota uji plagiasi.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {subscription ? (
                    <div className="space-y-6">
                        {/* Status Hero */}
                        <DoiStatusHero subscription={subscription} onOpenDrawer={() => handleOpenPackageDetail()} />

                        {/* Bento Grid: 2 Columns for Journal Managers */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Prefix Card */}
                            <div>
                                <DoiPrefixCard prefix={subscription.active_prefix} registeredJournalsCount={journalsCount} className="h-full" />
                            </div>

                            {/* Quota Gauge */}
                            <div>
                                <DoiQuotaGauge
                                    quotaTotal={subscription.similarity_quota_total}
                                    quotaUsed={subscription.similarity_quota_used}
                                    quotaResetDate={subscription.end_date}
                                    className="h-full"
                                />
                            </div>
                        </div>

                        {/* Quota Activity Table */}
                        <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">
                            <DoiQuotaLogTable logs={recentQuotaLogs} />
                        </div>
                    </div>
                ) : (
                    /* Inactive / No Subscription Notice for Journal Managers */
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-2 text-center">
                            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                                <AlertCircle className="size-6" />
                            </div>
                            <CardTitle className="text-lg font-bold text-foreground">Institusi Belum Berlangganan DOI</CardTitle>
                            <CardDescription className="mx-auto max-w-md text-xs">
                                Kampus Anda ({universityName}) saat ini belum mengaktifkan paket langganan DOI Crossref dan iThenticate.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mx-auto max-w-lg space-y-4 pt-2 pb-8 text-center">
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Untuk mendapatkan alokasi prefix DOI resmi dan kuota uji kesamaan artikel jurnal Anda, silakan berkoordinasi dengan
                                LPPM atau Administrator Kampus Anda agar mengajukan permohonan langganan konsorsium ke Majelis Diktilitbang PPM.
                            </p>
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenPackageDetail(packages[0])}
                                    className="text-xs shadow-2xs"
                                >
                                    <ShieldCheck className="mr-1.5 size-3.5" />
                                    Pelajari Manfaat Konsorsium DOI
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Package Detail Drawer */}
                <DoiPackageDrawer
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    subscription={subscription}
                    packageData={selectedPackage}
                    settings={doiSettings}
                />
            </div>
        </AppLayout>
    );
}
