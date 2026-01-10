/**
 * Journal Show/Detail Page - Admin Kampus
 *
 * @description Display journal details and all assessments (read-only)
 * @features View journal info, list assessments, view assessment details, download attachments
 * @route GET /admin-kampus/journals/{id}
 */
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Building2,
    Calendar,
    ExternalLink,
    FileText,
    Mail,
    TrendingUp,
    User,
    Eye,
    Bookmark,
    Globe,
    Award,
    BookOpen,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface University {
    id: number;
    name: string;
    code: string;
}

interface JournalUser {
    id: number;
    name: string;
    email: string;
}

interface ScientificField {
    id: number;
    name: string;
}

interface AssessmentUser {
    id: number;
    name: string;
}

interface Assessment {
    id: number;
    assessment_date: string;
    period: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    status_label: string;
    status_color: string;
    total_score: number;
    max_score: number;
    percentage: number;
    grade: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    user: AssessmentUser;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string | null;
    url: string | null;
    publisher: string | null;
    frequency: string;
    frequency_label: string;
    first_published_year: number | null;
    editor_in_chief: string | null;
    email: string | null;
    sinta_rank: number | null;
    sinta_rank_label: string;
    accreditation_status: string | null;
    accreditation_status_label: string;
    accreditation_grade: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    university: University;
    user: JournalUser;
    scientific_field: ScientificField | null;
    assessments: Assessment[];
}

interface Props {
    journal: Journal;
}

export default function JournalShow({ journal }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journals', href: route('admin-kampus.journals.index') },
        { title: journal.title, href: route('admin-kampus.journals.show', journal.id) },
    ];

    const getStatusBadge = (assessment: Assessment) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
            gray: 'secondary',
            yellow: 'default',
            green: 'outline',
        };

        return (
            <Badge variant={variants[assessment.status_color] || 'default'}>
                {assessment.status_label}
            </Badge>
        );
    };

    const getGradeBadge = (percentage: number) => {
        if (percentage >= 90) return <Badge className="bg-green-500 text-white">A</Badge>;
        if (percentage >= 80) return <Badge className="bg-blue-500 text-white">B</Badge>;
        if (percentage >= 70) return <Badge className="bg-yellow-500 text-white">C</Badge>;
        if (percentage >= 60) return <Badge className="bg-orange-500 text-white">D</Badge>;
        return <Badge variant="destructive">E</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Journal - ${journal.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin-kampus.journals.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {/* Journal Icon */}
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">
                                        {journal.title}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        {journal.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                                Inactive
                                            </Badge>
                                        )}
                                        {journal.sinta_rank && (
                                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                                <Award className="w-3 h-3 mr-1" />
                                                {journal.sinta_rank_label}
                                            </Badge>
                                        )}
                                        {journal.accreditation_status && (
                                            <Badge variant="outline">
                                                {journal.accreditation_status_label}
                                                {journal.accreditation_grade && ` (${journal.accreditation_grade})`}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Journal Details */}
                        <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Journal Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Bookmark className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">ISSN</p>
                                        <p className="font-medium text-foreground">{journal.issn}</p>
                                    </div>
                                </div>
                                {journal.e_issn && (
                                    <div className="flex items-center gap-3">
                                        <Bookmark className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">E-ISSN</p>
                                            <p className="font-medium text-foreground">{journal.e_issn}</p>
                                        </div>
                                    </div>
                                )}
                                {journal.url && (
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Website</p>
                                            <a
                                                href={journal.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                            >
                                                Visit Journal
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {journal.publisher && (
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Publisher</p>
                                            <p className="font-medium text-foreground">{journal.publisher}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Frequency</p>
                                        <p className="font-medium text-foreground">{journal.frequency_label}</p>
                                    </div>
                                </div>
                                {journal.first_published_year && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">First Published</p>
                                            <p className="font-medium text-foreground">{journal.first_published_year}</p>
                                        </div>
                                    </div>
                                )}
                                {journal.scientific_field && (
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Scientific Field</p>
                                            <p className="font-medium text-foreground">{journal.scientific_field.name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Manager & Contact */}
                        <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Manager & Contact</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Journal Manager</p>
                                        <p className="font-medium text-foreground">{journal.user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <a
                                            href={`mailto:${journal.user.email}`}
                                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {journal.user.email}
                                        </a>
                                    </div>
                                </div>
                                {journal.editor_in_chief && (
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Editor in Chief</p>
                                            <p className="font-medium text-foreground">{journal.editor_in_chief}</p>
                                        </div>
                                    </div>
                                )}
                                {journal.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Contact Email</p>
                                            <a
                                                href={`mailto:${journal.email}`}
                                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {journal.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-sidebar-border/70 dark:border-sidebar-border">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Created</p>
                                            <p className="text-sm text-foreground">{journal.created_at}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Updated</p>
                                            <p className="text-sm text-foreground">{journal.updated_at}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assessments Table */}
                    <div className="bg-card rounded-lg shadow-sm border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                        <div className="p-6 border-b border-sidebar-border/70 dark:border-sidebar-border">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Assessment History
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Assessor</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journal.assessments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No assessments available yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journal.assessments.map((assessment) => (
                                        <TableRow key={assessment.id}>
                                            <TableCell>{assessment.assessment_date}</TableCell>
                                            <TableCell>{assessment.period || '-'}</TableCell>
                                            <TableCell>{getStatusBadge(assessment)}</TableCell>
                                            <TableCell>
                                                {assessment.total_score.toFixed(1)} / {assessment.max_score.toFixed(1)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{assessment.percentage.toFixed(1)}%</span>
                                                    {getGradeBadge(assessment.percentage)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{assessment.user.name}</TableCell>
                                            <TableCell>{assessment.submitted_at || '-'}</TableCell>
                                            <TableCell className="text-center">
                                                <Link href={route('user.assessments.show', assessment.id)}>
                                                    <Button variant="ghost" size="sm" title="View Details">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
