import { DoiInvoiceDetailDrawer, DoiInvoiceStatsCard, DoiInvoiceTable } from '@/components/doi/invoices';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { DoiBankAccountData, DoiInvoiceDetailData, DoiInvoiceStatsData } from '@/types/doi';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Building2, Receipt, RefreshCw } from 'lucide-react';
import * as React from 'react';

interface AdminKampusInvoicesIndexProps {
    invoices: PaginatedData<DoiInvoiceDetailData>;
    bankAccounts: DoiBankAccountData[];
    stats?: DoiInvoiceStatsData;
    filters?: {
        status?: string;
        search?: string;
    };
    universityName?: string;
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
    {
        title: 'Faktur & Tagihan',
        href: route('admin-kampus.doi.invoices.index'),
    },
];

export default function AdminKampusInvoicesIndex({
    invoices,
    bankAccounts = [],
    stats,
    filters = {},
    universityName: propUnivName,
}: AdminKampusInvoicesIndexProps) {
    const { auth } = usePage().props as { auth?: { user?: { university?: { name: string } } } };
    const universityName = propUnivName || auth?.user?.university?.name || 'Institusi';

    const [selectedInvoice, setSelectedInvoice] = React.useState<DoiInvoiceDetailData | null>(null);
    const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
    const [drawerTab, setDrawerTab] = React.useState<'detail' | 'pay' | 'history'>('detail');
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    // Parse URL query on mount (e.g. ?invoice_id=123&action=pay)
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const invoiceIdParam = urlParams.get('invoice_id');
        const actionParam = urlParams.get('action');

        if (invoiceIdParam && invoices?.data) {
            const target = invoices.data.find((inv) => String(inv.id) === invoiceIdParam);
            if (target) {
                setSelectedInvoice(target);
                setDrawerTab(actionParam === 'pay' ? 'pay' : 'detail');
                setDrawerOpen(true);
            }
        }
    }, [invoices]);

    // Calculate fallback stats if not passed from controller
    const calculatedStats: DoiInvoiceStatsData = React.useMemo(() => {
        if (stats) return stats;

        const allItems = invoices?.data || [];
        const total = invoices?.total ?? allItems.length;
        let unpaid = 0;
        let paid = 0;
        let unpaidCount = 0;
        let paidCount = 0;

        allItems.forEach((inv) => {
            const amt = Number(inv.total_amount) || 0;
            if (inv.status === 'paid') {
                paid += amt;
                paidCount++;
            } else {
                unpaid += amt;
                unpaidCount++;
            }
        });

        return {
            total_invoices: total,
            unpaid_amount: unpaid,
            paid_amount: paid,
            unpaid_count: unpaidCount,
            paid_count: paidCount,
        };
    }, [stats, invoices]);

    const handleFilterChange = (status: string) => {
        router.get(
            route('admin-kampus.doi.invoices.index'),
            {
                ...filters,
                status: status === 'all' ? undefined : status,
                page: undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSearchChange = (search: string) => {
        router.get(
            route('admin-kampus.doi.invoices.index'),
            {
                ...filters,
                search: search.trim() ? search.trim() : undefined,
                page: undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePageChange = (url: string) => {
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewDetail = (invoice: DoiInvoiceDetailData) => {
        setSelectedInvoice(invoice);
        setDrawerTab('detail');
        setErrors({});
        setDrawerOpen(true);
    };

    const handleUploadProof = (invoice: DoiInvoiceDetailData) => {
        setSelectedInvoice(invoice);
        setDrawerTab('pay');
        setErrors({});
        setDrawerOpen(true);
    };

    const handleSubmitPaymentProof = (formData: FormData) => {
        if (!selectedInvoice) return;

        setIsSubmitting(true);
        setErrors({});

        router.post(route('admin-kampus.doi.invoices.payment-proof.store', selectedInvoice.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setDrawerOpen(false);
            },
            onError: (errs) => {
                setIsSubmitting(false);
                setErrors(errs);
            },
        });
    };

    const handleRefresh = () => {
        router.reload();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Faktur & Tagihan DOI" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Receipt className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Faktur & Tagihan Langganan</h1>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="size-4 shrink-0 text-muted-foreground/70" />
                            <span>
                                Daftar tagihan penerbitan Crossref DOI dan kuota Similarity Check untuk{' '}
                                <strong className="font-semibold text-foreground">{universityName}</strong>
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="text-xs shadow-2xs">
                            <Link href={route('admin-kampus.doi-subscription.index')}>
                                <ArrowLeft className="mr-1.5 size-3.5" />
                                Dashboard DOI
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleRefresh} className="text-xs shadow-2xs">
                            <RefreshCw className="mr-1.5 size-3.5" />
                            Segarkan
                        </Button>
                    </div>
                </div>

                {/* Summary Metrics */}
                <DoiInvoiceStatsCard stats={calculatedStats} />

                {/* Invoices List Table */}
                <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs sm:p-6">
                    <DoiInvoiceTable
                        invoices={invoices}
                        currentFilter={filters.status || 'all'}
                        currentSearch={filters.search || ''}
                        onFilterChange={handleFilterChange}
                        onSearchChange={handleSearchChange}
                        onViewDetail={handleViewDetail}
                        onUploadProof={handleUploadProof}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Invoice Detail Drawer */}
                <DoiInvoiceDetailDrawer
                    invoice={selectedInvoice}
                    bankAccounts={bankAccounts}
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    initialTab={drawerTab}
                    onSubmitPaymentProof={handleSubmitPaymentProof}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
        </AppLayout>
    );
}
