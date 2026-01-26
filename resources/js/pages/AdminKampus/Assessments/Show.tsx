import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, JournalAssessment } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, ClipboardCheck, FileText, User } from 'lucide-react';

/**
 * Assessment Detail Page (Admin Kampus)
 *
 * @description View detailed assessment information
 * @route GET /admin-kampus/assessments/{assessment}
 * @features View assessment details, responses, attachments
 */

interface Props {
    assessment: JournalAssessment;
}

export default function AssessmentShow({ assessment }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessments', href: route('admin-kampus.assessments.index') },
        { title: 'Detail', href: route('admin-kampus.assessments.show', assessment.id) },
    ];

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            draft: 'secondary',
            submitted: 'outline',
            reviewed: 'default',
        };

        const labels: Record<string, string> = {
            draft: 'Draft',
            submitted: 'Submitted',
            reviewed: 'Reviewed',
        };

        return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Assessment - ${assessment.journal.title}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Assessment Detail</h1>
                        <p className="text-muted-foreground">View assessment information and responses</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin-kampus.assessments.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Link>
                        </Button>
                        {assessment.status === 'submitted' && (
                            <Button asChild>
                                <Link href={route('admin-kampus.assessments.review', assessment.id)}>
                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                    Review Assessment
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Assessment Info */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{assessment.journal.title}</CardTitle>
                                <CardDescription>ISSN: {assessment.journal.issn}</CardDescription>
                            </div>
                            {getStatusBadge(assessment.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <span className="font-medium">Submitted by:</span> {assessment.user.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <span className="font-medium">Submitted:</span>{' '}
                                    {new Date(assessment.submitted_at || assessment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {assessment.reviewed_at && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            <span className="font-medium">Reviewed by:</span> {assessment.reviewer?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            <span className="font-medium">Reviewed:</span>{' '}
                                            {new Date(assessment.reviewed_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {assessment.admin_notes && (
                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Admin Notes:</p>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assessment.admin_notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Responses Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assessment Responses</CardTitle>
                        <CardDescription>
                            {assessment.responses?.length || 0} responses submitted
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assessment.responses && assessment.responses.length > 0 ? (
                            <div className="space-y-4">
                                {assessment.responses.map((response) => (
                                    <div key={response.id} className="border-l-4 border-primary pl-4 py-2">
                                        <p className="font-medium">
                                            {response.evaluation_indicator?.sub_category?.category?.name} -{' '}
                                            {response.evaluation_indicator?.sub_category?.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {response.evaluation_indicator?.question}
                                        </p>
                                        <p className="text-sm mt-1">
                                            <span className="font-medium">Score:</span> {response.score}
                                        </p>
                                        {response.notes && (
                                            <p className="text-sm text-muted-foreground mt-1">{response.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No responses yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
