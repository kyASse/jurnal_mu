import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react';

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
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Total Journals */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Jurnal</p>
                                <h3 className="mt-2 text-3xl font-bold">{stats.total_journals}</h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

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
                </div>

                {/* Content Area */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
