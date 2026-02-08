/**
 * Reviewer Dashboard Component
 *
 * @description
 * Main dashboard for reviewers showing their assignment overview, statistics, and recent activity.
 *
 * @route GET /reviewer/dashboard
 * @features View personal stats, active/completed assignments, workload status, quick access to profile
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ReviewerStats, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Award, CheckCircle, Clock, Edit, FileText, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/reviewer/dashboard' },
];

interface ReviewerAssignment {
    id: number;
    registration: {
        id: number;
        journal: {
            title: string;
        };
    };
    status: 'assigned' | 'in_progress' | 'completed';
    assigned_at: string;
    reviewed_at?: string;
}

interface Props {
    stats: ReviewerStats;
    recentAssignments: ReviewerAssignment[];
    workloadPercentage: number;
    isAvailable: boolean;
    user: User;
}

export default function ReviewerDashboard({ stats, recentAssignments, workloadPercentage, isAvailable, user }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'assigned':
                return <Badge variant="secondary">Assigned</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-600">In Progress</Badge>;
            case 'completed':
                return <Badge className="bg-green-600">Completed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getWorkloadColor = (percentage: number) => {
        if (percentage < 50) return 'bg-green-500';
        if (percentage < 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getWorkloadLabel = (percentage: number) => {
        if (percentage === 0) return 'No Active Assignments';
        if (percentage < 50) return 'Low Workload';
        if (percentage < 80) return 'Moderate Workload';
        if (percentage < 100) return 'High Workload';
        return 'At Maximum Capacity';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviewer Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
                        <p className="text-sm text-muted-foreground">Your reviewer dashboard and assignment overview</p>
                    </div>
                    <Link href="/reviewer/profile">
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                Total Assignments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.total_assignments}</div>
                            <p className="mt-1 text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Active
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.active_assignments}</div>
                            <p className="mt-1 text-xs text-muted-foreground">In progress</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <CheckCircle className="h-4 w-4" />
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed_assignments}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Finished reviews</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Award className="h-4 w-4" />
                                Average Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.average_score.toFixed(1)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Rating average</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Workload Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Current Workload
                        </CardTitle>
                        <CardDescription>Your assignment capacity and availability status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Assignments</span>
                            <span className="text-lg font-bold text-foreground">
                                {user.current_assignments || 0} / {user.max_assignments || 5}
                            </span>
                        </div>
                        <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                            <div className={`h-full transition-all ${getWorkloadColor(workloadPercentage)}`} style={{ width: `${workloadPercentage}%` }} />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{getWorkloadLabel(workloadPercentage)}</p>
                            <div className="flex items-center gap-2">
                                {isAvailable ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-600">Available</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="h-4 w-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-600">At Capacity</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Assignments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Assignments</CardTitle>
                        <CardDescription>Your latest coaching assignment activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentAssignments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Journal Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Assigned Date</TableHead>
                                        <TableHead>Reviewed Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentAssignments.map((assignment) => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium">{assignment.registration.journal.title}</TableCell>
                                            <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                                            <TableCell>{new Date(assignment.assigned_at).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell>{assignment.reviewed_at ? new Date(assignment.reviewed_at).toLocaleDateString('id-ID') : '-'}</TableCell>
                                            <TableCell className="text-right">
                                                {assignment.status !== 'completed' && (
                                                    <Link href={`/reviewer/assignments/${assignment.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            Review
                                                        </Button>
                                                    </Link>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground">No assignments yet. You'll see your coaching assignments here.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
