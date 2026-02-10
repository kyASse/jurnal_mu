import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import StatisticsDashboard from '@/components/StatisticsDashboard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type JournalStatistics, type PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardCheck, TrendingUp, UserPlus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps extends PageProps {
    stats: {
        total_journals: number;
        total_assessments: number;
        average_score: number;
        pending_lppm_count?: number;
    };
    statistics: JournalStatistics;
}

export default function Dashboard({ stats, statistics }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.role?.name === 'Super Admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Stats Cards */}
                <div
                    className={`grid auto-rows-min gap-4 ${isSuperAdmin && stats.pending_lppm_count !== undefined ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
                >
                    {/* Total Assessments */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Asesmen</p>
                                <h3 className="mt-2 text-3xl font-bold">{stats.total_assessments}</h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <ClipboardCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* Average Score */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Rata-rata Skor</p>
                                <h3 className="mt-2 text-3xl font-bold">
                                    {stats.average_score !== null ? Number(stats.average_score).toFixed(1) : '0.0'}
                                </h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    {/* Pending LPPM Registrations (Super Admin Only) */}
                    {isSuperAdmin && stats.pending_lppm_count !== undefined && (
                        <Link href="/admin/admin-kampus" className="block">
                            <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-md dark:border-sidebar-border dark:bg-neutral-950 dark:hover:border-orange-400">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Pending LPPM</p>
                                        <h3 className="mt-2 text-3xl font-bold">{stats.pending_lppm_count}</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">Click to review</p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                        <UserPlus className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Journal Statistics Visualization */}
                {statistics && statistics.totals.total_journals > 0 && (
                    <div className="mt-2">
                        <StatisticsDashboard statistics={statistics} />
                    </div>
                )}

                {/* Empty State */}
                {statistics && statistics.totals.total_journals === 0 && (
                    <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            <div className="relative z-10">
                                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Belum Ada Jurnal</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {isSuperAdmin
                                        ? 'Belum ada jurnal yang terdaftar di sistem.'
                                        : auth.user?.role?.name === 'Admin Kampus'
                                          ? 'Belum ada jurnal yang terdaftar di universitas Anda.'
                                          : 'Anda belum mengelola jurnal. Mulai dengan menambahkan jurnal baru.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
