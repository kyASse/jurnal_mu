import * as React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
    SuperAdminDoiManagementProps,
    DoiSubscriptionData,
    AdjustQuotaFormData,
    DoiPackageFormData,
    DoiBankAccountFormData,
} from '@/types/doi';
import {
    DoiAdminStatsCards,
    DoiVerificationTable,
    DoiVerificationDrawer,
    DoiVerificationDrawerProof,
    DoiSubscriptionsMasterTable,
    DoiQuotaAdjustDialog,
    DoiPackageManagementTab,
    DoiBankAccountManagementTab,
} from '@/components/doi/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    RefreshCw,
    ShieldAlert,
    Building2,
    Package,
    Landmark,
    Layers,
} from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kelola Layanan DOI (Diktilitbang)', href: route('admin.doi-management.index') },
];

export default function SuperAdminDoiIndex({
    stats,
    pendingProofs = [],
    subscriptions,
    packages = [],
    bankAccounts = [],
    filters,
}: SuperAdminDoiManagementProps) {
    const [activeTab, setActiveTab] = React.useState<string>('verification');
    const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

    // Verification Drawer State
    const [selectedProof, setSelectedProof] = React.useState<DoiVerificationDrawerProof | null>(null);
    const [verificationDrawerOpen, setVerificationDrawerOpen] = React.useState<boolean>(false);

    // Quota Adjustment State
    const [selectedSubscriptionForQuota, setSelectedSubscriptionForQuota] = React.useState<DoiSubscriptionData | null>(null);
    const [quotaDialogOpen, setQuotaDialogOpen] = React.useState<boolean>(false);

    // Read initial tab from URL if present
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['verification', 'subscriptions', 'packages', 'bank-accounts'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, []);

    // Quick Refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => {
                setIsRefreshing(false);
                toast.success('Data pusat kendali DOI berhasil diperbarui');
            },
        });
    };

    // Review Payment Proof
    const handleReviewProof = (proof: DoiVerificationDrawerProof) => {
        setSelectedProof(proof);
        setVerificationDrawerOpen(true);
    };

    // Approve Payment Proof
    const handleApproveProof = (proofId: number, adminNotes?: string) => {
        setIsSubmitting(true);
        router.post(
            route('admin.doi-management.payment-proofs.approve', proofId),
            { admin_notes: adminNotes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setVerificationDrawerOpen(false);
                    setSelectedProof(null);
                    toast.success('Bukti pembayaran berhasil disetujui & langganan diaktifkan.');
                },
                onError: (errors) => {
                    const errMsg = Object.values(errors)[0] as string || 'Gagal memverifikasi pembayaran.';
                    toast.error(errMsg);
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Reject Payment Proof
    const handleRejectProof = (proofId: number, adminNotes: string) => {
        setIsSubmitting(true);
        router.post(
            route('admin.doi-management.payment-proofs.reject', proofId),
            { admin_notes: adminNotes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setVerificationDrawerOpen(false);
                    setSelectedProof(null);
                    toast.success('Bukti pembayaran berhasil ditolak dan status dikembalikan.');
                },
                onError: (errors) => {
                    const errMsg = Object.values(errors)[0] as string || 'Gagal menolak pembayaran.';
                    toast.error(errMsg);
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Subscription Table Handlers
    const handleSearchSubscription = (search: string) => {
        router.get(
            route('admin.doi-management.index'),
            { search, status: filters?.status, tab: 'subscriptions' },
            { preserveState: true, preserveScroll: true, only: ['subscriptions'] }
        );
    };

    const handleFilterSubscription = (status: string) => {
        router.get(
            route('admin.doi-management.index'),
            { status: status === 'all' ? undefined : status, search: filters?.search, tab: 'subscriptions' },
            { preserveState: true, preserveScroll: true, only: ['subscriptions'] }
        );
    };

    const handleSubscriptionPageChange = (url: string) => {
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            only: ['subscriptions'],
        });
    };

    const handleOpenAdjustQuota = (subscription: DoiSubscriptionData) => {
        setSelectedSubscriptionForQuota(subscription);
        setQuotaDialogOpen(true);
    };

    const handleConfirmAdjustQuota = (subscriptionId: number, data: AdjustQuotaFormData) => {
        setIsSubmitting(true);
        router.post(
            route('admin.doi-management.subscriptions.adjust-quota', subscriptionId),
            {
                amount: data.amount,
                change_type: data.change_type,
                description: data.description,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setQuotaDialogOpen(false);
                    setSelectedSubscriptionForQuota(null);
                    toast.success('Penyesuaian kuota similarity berhasil diterapkan.');
                },
                onError: (errors) => {
                    const errMsg = Object.values(errors)[0] as string || 'Gagal menyesuaikan kuota.';
                    toast.error(errMsg);
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Package Management Handlers
    const handleCreatePackage = (data: DoiPackageFormData) => {
        setIsSubmitting(true);
        router.post(route('admin.doi-management.packages.store'), data as unknown as Record<string, unknown>, {
            preserveScroll: true,
            onSuccess: () => toast.success('Paket langganan baru berhasil dibuat.'),
            onError: (errors) => {
                const errMsg = Object.values(errors)[0] as string || 'Gagal membuat paket.';
                toast.error(errMsg);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleUpdatePackage = (id: number, data: DoiPackageFormData) => {
        setIsSubmitting(true);
        router.put(route('admin.doi-management.packages.update', id), data as unknown as Record<string, unknown>, {
            preserveScroll: true,
            onSuccess: () => toast.success('Paket langganan berhasil diperbarui.'),
            onError: (errors) => {
                const errMsg = Object.values(errors)[0] as string || 'Gagal memperbarui paket.';
                toast.error(errMsg);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeletePackage = (id: number) => {
        setIsSubmitting(true);
        router.delete(route('admin.doi-management.packages.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Paket langganan berhasil dihapus.'),
            onError: (errors) => {
                const errMsg = Object.values(errors)[0] as string || 'Gagal menghapus paket.';
                toast.error(errMsg);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Bank Account Management Handlers
    const handleCreateBankAccount = (data: DoiBankAccountFormData) => {
        setIsSubmitting(true);
        router.post(route('admin.doi-management.bank-accounts.store'), data as unknown as Record<string, unknown>, {
            preserveScroll: true,
            onSuccess: () => toast.success('Rekening bank resmi berhasil ditambahkan.'),
            onError: (errors) => {
                const errMsg = Object.values(errors)[0] as string || 'Gagal menambahkan rekening.';
                toast.error(errMsg);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleUpdateBankAccount = (id: number, data: DoiBankAccountFormData) => {
        setIsSubmitting(true);
        router.put(route('admin.doi-management.bank-accounts.update', id), data as unknown as Record<string, unknown>, {
            preserveScroll: true,
            onSuccess: () => toast.success('Rekening bank berhasil diperbarui.'),
            onError: (errors) => {
                const errMsg = Object.values(errors)[0] as string || 'Gagal memperbarui rekening.';
                toast.error(errMsg);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeleteBankAccount = (id: number) => {
        setIsSubmitting(true);
        router.delete(route('admin.doi-management.bank-accounts.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Rekening bank berhasil dihapus.'),
            onError: (errors) => {
                const errMsg = Object.values(errors)[0] as string || 'Gagal menghapus rekening.';
                toast.error(errMsg);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const pendingCount = pendingProofs.length || stats?.pending_proofs_count || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pusat Kendali Layanan DOI & Similarity Check" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                Super Admin Diktilitbang PPM
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Pusat Kendali Layanan DOI & Similarity Check
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola verifikasi pembayaran bukti transfer, alokasi kuota Turnitin PTMA, paket aktivasi tahunan, dan nomor rekening resmi.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="gap-2"
                        >
                            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Segarkan Data
                        </Button>
                    </div>
                </div>

                {/* Top Metrics Cards */}
                <DoiAdminStatsCards
                    stats={stats}
                    onViewPendingQueue={() => setActiveTab('verification')}
                />

                {/* Main Interactive Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 p-1.5 sm:flex sm:w-auto sm:inline-flex">
                        <TabsTrigger value="verification" className="gap-2 py-2 text-xs sm:text-sm">
                            <ShieldAlert className="size-4 text-amber-500" />
                            <span>Antrian Verifikasi</span>
                            {pendingCount > 0 && (
                                <Badge variant="secondary" className="ml-1 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                    {pendingCount}
                                </Badge>
                            )}
                        </TabsTrigger>

                        <TabsTrigger value="subscriptions" className="gap-2 py-2 text-xs sm:text-sm">
                            <Building2 className="size-4 text-blue-500" />
                            <span>Master Langganan PTMA</span>
                        </TabsTrigger>

                        <TabsTrigger value="packages" className="gap-2 py-2 text-xs sm:text-sm">
                            <Package className="size-4 text-purple-500" />
                            <span>Paket Langganan</span>
                            {packages.length > 0 && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {packages.length}
                                </Badge>
                            )}
                        </TabsTrigger>

                        <TabsTrigger value="bank-accounts" className="gap-2 py-2 text-xs sm:text-sm">
                            <Landmark className="size-4 text-emerald-500" />
                            <span>Rekening Bank Resmi</span>
                            {bankAccounts.length > 0 && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {bankAccounts.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Antrian Verifikasi (Pending Queue) */}
                    <TabsContent value="verification" className="mt-6 space-y-4">
                        <DoiVerificationTable
                            pendingProofs={pendingProofs as DoiVerificationDrawerProof[]}
                            onReviewProof={handleReviewProof}
                        />
                    </TabsContent>

                    {/* Tab 2: Master Langganan PTMA */}
                    <TabsContent value="subscriptions" className="mt-6 space-y-4">
                        <DoiSubscriptionsMasterTable
                            subscriptions={subscriptions}
                            currentFilter={filters?.status || 'all'}
                            currentSearch={filters?.search || ''}
                            onFilterChange={handleFilterSubscription}
                            onSearchChange={handleSearchSubscription}
                            onAdjustQuota={handleOpenAdjustQuota}
                            onPageChange={handleSubscriptionPageChange}
                        />
                    </TabsContent>

                    {/* Tab 3: Paket Langganan */}
                    <TabsContent value="packages" className="mt-6 space-y-4">
                        <DoiPackageManagementTab
                            packages={packages}
                            onCreatePackage={handleCreatePackage}
                            onUpdatePackage={handleUpdatePackage}
                            onDeletePackage={handleDeletePackage}
                            isSubmitting={isSubmitting}
                        />
                    </TabsContent>

                    {/* Tab 4: Rekening Bank Resmi */}
                    <TabsContent value="bank-accounts" className="mt-6 space-y-4">
                        <DoiBankAccountManagementTab
                            bankAccounts={bankAccounts}
                            onCreateBankAccount={handleCreateBankAccount}
                            onUpdateBankAccount={handleUpdateBankAccount}
                            onDeleteBankAccount={handleDeleteBankAccount}
                            isSubmitting={isSubmitting}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Verification Detail Drawer */}
            <DoiVerificationDrawer
                proof={selectedProof}
                open={verificationDrawerOpen}
                onOpenChange={setVerificationDrawerOpen}
                onApprove={handleApproveProof}
                onReject={handleRejectProof}
                isSubmitting={isSubmitting}
            />

            {/* Quota Adjustment Dialog */}
            <DoiQuotaAdjustDialog
                subscription={selectedSubscriptionForQuota}
                open={quotaDialogOpen}
                onOpenChange={setQuotaDialogOpen}
                onConfirm={handleConfirmAdjustQuota}
                isSubmitting={isSubmitting}
            />
        </AppLayout>
    );
}
