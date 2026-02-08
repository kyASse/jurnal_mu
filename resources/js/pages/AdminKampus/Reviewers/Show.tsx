/**
 * Admin Kampus Reviewer Show Component
 *
 * @description
 * University-scoped reviewer profile view. Displays reviewer from admin's university only.
 *
 * @route GET /admin-kampus/reviewers/{id}
 * @features View reviewer stats, assignment history, expertise areas, workload visualization
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ReviewerStats, type ScientificField, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Award, BookOpen, CheckCircle, Clock, Edit, Mail, MapPin, TrendingUp, UserCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'User Management', href: '#' },
    { title: 'Reviewers', href: '/admin-kampus/reviewers' },
    { title: 'Profile', href: '#' },
];

interface Props {
    reviewer: User;
    stats: ReviewerStats;
    expertiseFields: ScientificField[];
    workloadPercentage: number;
    isAvailable: boolean;
}

export default function ReviewerShow({ reviewer, stats, expertiseFields, workloadPercentage, isAvailable }: Props) {
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
            <Head title={`Reviewer: ${reviewer.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Reviewer Profile</h1>
                        <p className="text-sm text-muted-foreground">View reviewer details and performance statistics</p>
                    </div>
                    <Link href={`/admin-kampus/reviewers/${reviewer.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* Profile Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Reviewer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center">
                                {reviewer.avatar_url ? (
                                    <img src={reviewer.avatar_url} alt={reviewer.name} className="h-24 w-24 rounded-full" />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                        {reviewer.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </div>
                                )}
                                <h2 className="mt-4 text-xl font-bold text-foreground">{reviewer.name}</h2>
                                <Badge className="mt-2 bg-purple-600">
                                    <Award className="mr-1 h-3 w-3" />
                                    Reviewer
                                </Badge>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 border-t pt-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm text-foreground">{reviewer.email}</p>
                                    </div>
                                </div>

                                {reviewer.university && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">University</p>
                                            <p className="text-sm text-foreground">{reviewer.university.name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Workload Status */}
                            <div className="space-y-3 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Current Workload</span>
                                    <span className="text-sm font-bold text-foreground">
                                        {reviewer.current_assignments || 0} / {reviewer.max_assignments || 5}
                                    </span>
                                </div>
                                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                                    <div className={`h-full transition-all ${getWorkloadColor(workloadPercentage)}`} style={{ width: `${workloadPercentage}%` }} />
                                </div>
                                <p className="text-center text-sm text-muted-foreground">{getWorkloadLabel(workloadPercentage)}</p>
                            </div>

                            {/* Availability Status */}
                            <div className="rounded-lg border p-3">
                                <div className="flex items-center gap-2">
                                    {isAvailable ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <span className="font-medium text-green-600">Available for Assignments</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="h-5 w-5 text-red-600" />
                                            <span className="font-medium text-red-600">At Maximum Capacity</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats & Details */}
                    <div className="space-y-4 md:col-span-2">
                        {/* Statistics Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Assignments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{stats.total_assignments}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">{stats.active_assignments}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{stats.completed_assignments}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-600">{stats.average_score.toFixed(1)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Biography */}
                        {reviewer.reviewer_bio && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Biography</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{reviewer.reviewer_bio}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Expertise */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Areas of Expertise
                                </CardTitle>
                                <CardDescription>Scientific fields this reviewer specializes in</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {expertiseFields.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {expertiseFields.map((field) => (
                                            <Badge key={field.id} variant="outline" className="px-3 py-1">
                                                {field.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No expertise areas defined yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Assignments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Assignment History
                                </CardTitle>
                                <CardDescription>Recent coaching assignments and reviews</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.total_assignments > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <UserCheck className="h-8 w-8 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium text-foreground">Coaching Assignments</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {stats.completed_assignments} completed, {stats.active_assignments} in progress
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href="/admin-kampus/pembinaan">
                                                <Button variant="outline" size="sm">
                                                    View All
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No assignments yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                    <Link href="/admin-kampus/reviewers">
                        <Button variant="outline">Back to Reviewers</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
