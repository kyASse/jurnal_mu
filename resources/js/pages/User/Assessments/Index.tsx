/**
 * Assessments Index Page
 * 
 * @description User's assessment listing page - displays all self-assessments
 * @features List view, filter by status, search, pagination, create new
 * @route GET /user/assessments
 */
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Eye,
    Edit,
    Trash2,
    FileText,
    Calendar,
    TrendingUp,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string;
}

interface User {
    id: number;
    name: string;
}

interface Assessment {
    id: number;
    journal: Journal;
    user: User;
    assessment_date: string;
    period: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    status_label: string;
    status_color: string;
    total_score: number;
    max_score: number;
    percentage: number;
    grade: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedAssessments {
    data: Assessment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    assessments: PaginatedAssessments;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function AssessmentsIndex({ assessments, filters }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    // Apply filters
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('user.assessments.index'),
                { search, status },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status, router]);

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus assessment ini?')) {
            router.delete(route('user.assessments.destroy', id), {
                preserveScroll: true,
            });
        }
    };

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
        if (percentage >= 90) return <Badge className="bg-green-500">A</Badge>;
        if (percentage >= 80) return <Badge className="bg-blue-500">B</Badge>;
        if (percentage >= 70) return <Badge className="bg-yellow-500">C</Badge>;
        if (percentage >= 60) return <Badge className="bg-orange-500">D</Badge>;
        return <Badge variant="destructive">E</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Self-Assessment" />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Self-Assessment</h1>
                        <p className="text-muted-foreground mt-2">
                            Kelola penilaian mandiri untuk jurnal Anda
                        </p>
                    </div>
                    <Link href={route('user.assessments.create')}>
                        <Button size="lg" className="shadow-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Assessment Baru
                        </Button>
                    </Link>
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6 shadow-sm">
                        {flash.success}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari jurnal..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <Select value={status || 'all'} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="bg-card border rounded-lg shadow-sm overflow-hidden mb-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Jurnal</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Periode</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Skor</TableHead>
                                <TableHead className="text-right">Grade</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assessments.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground text-lg font-medium mb-2">
                                            Belum ada assessment
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            Buat assessment pertama Anda untuk memulai!
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assessments.data.map((assessment) => (
                                    <TableRow key={assessment.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-semibold">
                                                    {assessment.journal.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    ISSN: {assessment.journal.issn}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                {new Date(assessment.assessment_date).toLocaleDateString('id-ID')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {assessment.period || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(assessment)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-semibold">
                                                    {Number(assessment.total_score).toFixed(2)}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    / {Number(assessment.max_score).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                ({Number(assessment.percentage).toFixed(1)}%)
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {assessment.status !== 'draft' && getGradeBadge(assessment.percentage)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('user.assessments.show', assessment.id)}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {assessment.status === 'draft' && (
                                                    <>
                                                        <Link href={route('user.assessments.edit', assessment.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(assessment.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {assessments.last_page > 1 && (
                    <div className="flex justify-center gap-2 mb-6">
                        {assessments.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card p-6 rounded-lg border shadow-sm">
                    <div className="text-center p-4">
                        <div className="text-3xl font-bold text-primary mb-1">{assessments.total}</div>
                        <div className="text-sm text-muted-foreground font-medium">Total Assessment</div>
                    </div>
                    <div className="text-center p-4 border-l border-r">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">
                            {assessments.data.filter(a => a.status === 'draft').length}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">Draft</div>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                            {assessments.data.filter(a => a.status === 'submitted').length}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">Submitted</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
