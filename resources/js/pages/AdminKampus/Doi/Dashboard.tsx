import * as React from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
    DoiStatusHero,
    DoiPrefixCard,
    DoiQuotaGauge,
    DoiActiveInvoiceCard,
    DoiQuotaLogTable,
    DoiPackageDrawer,
    DoiEmptyState,
} from '@/components/doi';
import { DoiActiveInvoiceData, DoiPackageData, DoiQuotaLogData, DoiSubscriptionData } from '@/types/doi';
import { Head } from '@inertiajs/react';
import { Globe, Building2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminKampusDoiDashboardProps {
    subscription: DoiSubscriptionData | null;
    activeInvoice: DoiActiveInvoiceData | null;
    recentQuotaLogs: DoiQuotaLogData[];
    packages: DoiPackageData[];
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
        href: route('admin-kampus.doi-subscription.index'),
    },
];

export default function AdminKampusDoiDashboard({
    subscription,
    activeInvoice,
    recentQuotaLogs = [],
    packages = [],
    universityName = 'Institusi',
    journalsCount = 0,
}: AdminKampusDoiDashboardProps) {
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

    const handleSelectPackageFromEmpty = (pkg: DoiPackageData) => {
        setSelectedPackage(pkg);
        setDrawerOpen(true);
    };

    const handleRenew = () => {
        handleOpenPackageDetail();
    };

    const handleTopUp = () => {
        handleOpenPackageDetail();
    };

    const handleUploadProof = (invoiceId: number) => {
        console.log('Upload proof for invoice:', invoiceId);
    };

    const handleViewInvoiceDetail = (invoiceId: number) => {
        console.log('View invoice detail:', invoiceId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Langganan DOI & Similarity Check" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Langganan DOI & Similarity Check
                            </h1>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                            <Building2 className="size-4 shrink-0 text-muted-foreground/70" />
                            <span>
                                Pengelolaan Crossref DOI dan kuota iThenticate untuk{' '}
                                <strong className="font-semibold text-foreground">{universityName}</strong>
                            </span>
                        </p>
                    </div>

                    {subscription && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenPackageDetail()}
                                className="text-xs shadow-2xs"
                            >
                                <HelpCircle className="mr-1.5 size-3.5" />
                                Informasi Layanan
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                {subscription ? (
                    <div className="space-y-6">
                        {/* Status Hero Card */}
                        <DoiStatusHero
                            subscription={subscription}
                            onOpenDrawer={() => handleOpenPackageDetail()}
                            onRenew={handleRenew}
                        />

                        {/* Bento Grid: Metrics and Invoices */}
                        <div
                            className={cn(
                                'grid grid-cols-1 gap-6',
                                activeInvoice ? 'lg:grid-cols-3' : 'md:grid-cols-2'
                            )}
                        >
                            {/* Prefix Crossref Card */}
                            <div>
                                <DoiPrefixCard
                                    prefix={subscription.active_prefix}
                                    registeredJournalsCount={journalsCount}
                                    className="h-full"
                                />
                            </div>

                            {/* Similarity Check Quota Gauge */}
                            <div>
                                <DoiQuotaGauge
                                    quotaTotal={subscription.similarity_quota_total}
                                    quotaUsed={subscription.similarity_quota_used}
                                    quotaResetDate={subscription.end_date}
                                    onTopUp={handleTopUp}
                                    className="h-full"
                                />
                            </div>

                            {/* Active Invoice Card (when unpaid invoice exists) */}
                            {activeInvoice && (
                                <div>
                                    <DoiActiveInvoiceCard
                                        invoice={activeInvoice}
                                        onUploadProof={handleUploadProof}
                                        onViewDetail={handleViewInvoiceDetail}
                                        className="h-full"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Quota Activity Audit Table */}
                        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-xs">
                            <DoiQuotaLogTable logs={recentQuotaLogs} />
                        </div>
                    </div>
                ) : (
                    /* Empty State when no active subscription exists */
                    <DoiEmptyState
                        packages={packages}
                        onSelectPackage={handleSelectPackageFromEmpty}
                    />
                )}

                {/* Package Detail Drawer */}
                <DoiPackageDrawer
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    subscription={subscription}
                    packageData={selectedPackage}
                />
            </div>
        </AppLayout>
    );
}
