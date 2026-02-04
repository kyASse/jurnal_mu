import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export interface AssessmentNote {
    id: number;
    journal_assessment_id: number;
    user_id: number;
    author_role: string;
    note_type: 'submission' | 'approval' | 'rejection' | 'review' | 'general';
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface AssessmentNotesTimelineProps {
    notes: AssessmentNote[];
    title?: string;
}

/**
 * AssessmentNotesTimeline Component
 *
 * Displays a timeline of assessment notes with author information, role badges,
 * and timestamps. Shows notes from User, Admin Kampus, Reviewer in chronological order.
 *
 * @component
 * @example
 * ```tsx
 * <AssessmentNotesTimeline
 *   notes={assessmentNotes}
 *   title="Catatan Assessment"
 * />
 * ```
 */
export default function AssessmentNotesTimeline({
    notes,
    title = 'Catatan Assessment',
}: AssessmentNotesTimelineProps) {
    const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
        switch (role.toLowerCase()) {
            case 'admin kampus':
            case 'lppm':
                return 'default';
            case 'reviewer':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getNoteTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            submission: 'Pengajuan',
            approval: 'Persetujuan',
            rejection: 'Penolakan',
            review: 'Review',
            general: 'Catatan Umum',
        };
        return labels[type] || type;
    };

    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), "dd MMM yyyy, HH:mm 'WIB'", {
                locale: id,
            });
        } catch {
            return dateString;
        }
    };

    if (!notes || notes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Belum ada catatan untuk assessment ini.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {notes.map((note, index) => (
                        <div
                            key={note.id}
                            className="relative border-l-2 border-gray-300 pl-4 pb-4 last:pb-0"
                        >
                            {/* Timeline dot */}
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white" />

                            {/* Note header */}
                            <div className="flex items-start gap-2 mb-2 flex-wrap">
                                <Badge variant={getRoleBadgeVariant(note.author_role)}>
                                    {note.author_role}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {getNoteTypeLabel(note.note_type)}
                                </Badge>
                                <span className="text-sm font-medium text-gray-900">
                                    {note.user.name}
                                </span>
                            </div>

                            {/* Note content */}
                            <div className="prose prose-sm max-w-none">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {note.content}
                                </p>
                            </div>

                            {/* Timestamp */}
                            <p className="text-xs text-gray-500 mt-2">
                                {formatDate(note.created_at)}
                            </p>

                            {/* Separator line (except for last item) */}
                            {index < notes.length - 1 && (
                                <div className="absolute left-0 bottom-0 w-full h-px bg-gray-200" />
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
