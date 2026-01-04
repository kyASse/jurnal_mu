/**
 * Assessment Show/Detail Page
 * 
 * @description Display assessment details with all responses and scoring
 * @features View only, download attachments, submit button for drafts
 * @route GET /user/assessments/{id}
 */
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Edit,
    Send,
    Download,
    Calendar,
    FileText,
    TrendingUp,
    CheckCircle,
    XCircle,
    ArrowLeft,
} from 'lucide-react';

interface Journal {
    id: number;
    title: string;
    issn: string;
    url: string;
}

interface EvaluationIndicator {
    id: number;
    code: string;
    category: string;
    question: string;
    description: string | null;
    weight: number;
    answer_type: 'boolean' | 'scale' | 'text';
}

interface Attachment {
    id: number;
    original_filename: string;
    file_size: number;
    human_file_size: string;
    mime_type: string;
    download_url: string;
}

interface Response {
    id: number;
    evaluation_indicator: EvaluationIndicator;
    answer_boolean: boolean | null;
    answer_scale: number | null;
    answer_text: string | null;
    formatted_answer: string;
    score: number;
    notes: string | null;
    attachments: Attachment[];
}

interface Assessment {
    id: number;
    journal: Journal;
    assessment_date: string;
    period: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    status_label: string;
    status_color: string;
    total_score: number;
    max_score: number;
    percentage: number;
    grade: string;
    notes: string | null;
    admin_notes: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    assessment: Assessment;
    responsesByCategory: Record<string, Response[]>;
}

export default function AssessmentShow({ assessment, responsesByCategory }: Props) {
    const { flash } = usePage().props as any;

    const handleSubmit = () => {
        if (confirm('Yakin ingin submit assessment? Assessment yang sudah disubmit tidak dapat diedit lagi.')) {
            router.post(route('user.assessments.submit', assessment.id));
        }
    };

    const handleDownload = (attachmentId: number) => {
        window.open(route('user.assessments.attachments.download', attachmentId), '_blank');
    };

    const getStatusBadge = () => {
        const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
            gray: 'secondary',
            yellow: 'default',
            green: 'outline',
        };

        return (
            <Badge variant={variants[assessment.status_color] || 'default'} className="text-lg px-4 py-1">
                {assessment.status_label}
            </Badge>
        );
    };

    const getGradeBadge = () => {
        const percentage = assessment.percentage;
        if (percentage >= 90) return <Badge className="bg-green-500 text-white text-2xl px-6 py-2">A</Badge>;
        if (percentage >= 80) return <Badge className="bg-blue-500 text-white text-2xl px-6 py-2">B</Badge>;
        if (percentage >= 70) return <Badge className="bg-yellow-500 text-white text-2xl px-6 py-2">C</Badge>;
        if (percentage >= 60) return <Badge className="bg-orange-500 text-white text-2xl px-6 py-2">D</Badge>;
        return <Badge variant="destructive" className="text-2xl px-6 py-2">E</Badge>;
    };

    const renderAnswer = (response: Response) => {
        const indicator = response.evaluation_indicator;

        if (indicator.answer_type === 'boolean') {
            return response.answer_boolean ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Ya
                </div>
            ) : (
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <XCircle className="w-5 h-5" />
                    Tidak
                </div>
            );
        }

        if (indicator.answer_type === 'scale') {
            return (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{response.answer_scale}/5</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <div
                                key={num}
                                className={`w-3 h-3 rounded-full ${
                                    num <= (response.answer_scale || 0)
                                        ? 'bg-primary'
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            );
        }

        return <p className="text-sm whitespace-pre-wrap">{response.answer_text}</p>;
    };

    return (
        <AppLayout>
            <Head title="Detail Assessment" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <Link href={route('user.assessments.index')}>
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Detail Self-Assessment</h1>
                        <p className="text-muted-foreground mt-1">
                            Hasil penilaian mandiri untuk jurnal {assessment.journal.title}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {assessment.status === 'draft' && (
                            <>
                                <Link href={route('user.assessments.edit', assessment.id)}>
                                    <Button variant="outline">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button onClick={handleSubmit}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Assessment
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {flash.success}
                    </div>
                )}

                {/* Summary Card */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">{assessment.journal.title}</CardTitle>
                                <CardDescription className="mt-2">
                                    ISSN: {assessment.journal.issn}
                                </CardDescription>
                            </div>
                            {getStatusBadge()}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">Tanggal Assessment:</span>
                                    <span className="font-semibold">
                                        {new Date(assessment.assessment_date).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                {assessment.period && (
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Periode:</span>
                                        <span className="font-semibold">{assessment.period}</span>
                                    </div>
                                )}
                            </div>

                            {assessment.status !== 'draft' && (
                                <div className="border-l pl-6">
                                    <div className="text-center space-y-2">
                                        <div className="text-sm text-muted-foreground">Nilai Akhir</div>
                                        {getGradeBadge()}
                                        <div className="text-sm font-semibold">
                                            {assessment.percentage.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {assessment.total_score.toFixed(2)} / {assessment.max_score.toFixed(2)} poin
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {assessment.notes && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm font-semibold mb-1">Catatan:</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {assessment.notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Score Summary */}
                {assessment.status !== 'draft' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Skor per Kategori</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.keys(responsesByCategory).map((category) => {
                                    const responses = responsesByCategory[category];
                                    const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
                                    const maxScore = responses.reduce(
                                        (sum, r) => sum + r.evaluation_indicator.weight,
                                        0
                                    );
                                    const percentage = (totalScore / maxScore) * 100;

                                    return (
                                        <div key={category} className="border rounded-lg p-4">
                                            <h3 className="font-semibold mb-2">{category}</h3>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-2xl font-bold">
                                                    {percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {totalScore.toFixed(2)} / {maxScore.toFixed(2)} poin
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Responses by Category */}
                {Object.keys(responsesByCategory).map((category) => (
                    <Card key={category}>
                        <CardHeader>
                            <CardTitle>{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {responsesByCategory[category].map((response, index) => (
                                    <div key={response.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline">
                                                        {response.evaluation_indicator.code}
                                                    </Badge>
                                                    <Badge>
                                                        {response.evaluation_indicator.weight} poin
                                                    </Badge>
                                                    {assessment.status !== 'draft' && (
                                                        <Badge variant="secondary">
                                                            Skor: {response.score.toFixed(2)}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold">
                                                    {index + 1}. {response.evaluation_indicator.question}
                                                </h4>
                                                {response.evaluation_indicator.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {response.evaluation_indicator.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                            <div>
                                                <span className="text-sm font-semibold">Jawaban:</span>
                                                <div className="mt-2">{renderAnswer(response)}</div>
                                            </div>

                                            {response.notes && (
                                                <div>
                                                    <span className="text-sm font-semibold">Catatan:</span>
                                                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                                        {response.notes}
                                                    </p>
                                                </div>
                                            )}

                                            {response.attachments.length > 0 && (
                                                <div>
                                                    <span className="text-sm font-semibold">File Bukti:</span>
                                                    <div className="mt-2 space-y-2">
                                                        {response.attachments.map((attachment) => (
                                                            <div
                                                                key={attachment.id}
                                                                className="flex items-center justify-between bg-background border rounded-lg p-3"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                                                    <div>
                                                                        <div className="text-sm font-medium">
                                                                            {attachment.original_filename}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {attachment.human_file_size}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDownload(attachment.id)}
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Admin Notes (if reviewed) */}
                {assessment.admin_notes && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle>Catatan Admin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{assessment.admin_notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
