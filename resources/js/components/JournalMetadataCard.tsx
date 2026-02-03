import { AssessmentJournalMetadata } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, Link as LinkIcon } from 'lucide-react';

interface JournalMetadataCardProps {
    metadata: AssessmentJournalMetadata;
    readOnly?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function JournalMetadataCard({
    metadata,
    readOnly = false,
    onEdit,
    onDelete,
}: JournalMetadataCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                        {/* Issue Identifier */}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                            <h4 className="font-semibold text-base">
                                Vol. {metadata.volume} No. {metadata.number} ({metadata.year})
                            </h4>
                            <Badge variant="outline" className="text-xs">
                                {monthNames[metadata.month - 1]}
                            </Badge>
                        </div>

                        {/* URL Issue */}
                        {metadata.url_issue && (
                            <div className="flex items-start gap-2 pl-7">
                                <LinkIcon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <a
                                    href={metadata.url_issue}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline break-all"
                                >
                                    {metadata.url_issue}
                                </a>
                            </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-7 pt-2">
                            {/* Editor Metrics */}
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Editor</p>
                                <div className="flex gap-2 text-sm">
                                    <span className="font-medium">{metadata.jumlah_negara_editor}</span>
                                    <span className="text-muted-foreground">negara</span>
                                </div>
                                <div className="flex gap-2 text-sm">
                                    <span className="font-medium">{metadata.jumlah_institusi_editor}</span>
                                    <span className="text-muted-foreground">institusi</span>
                                </div>
                            </div>

                            {/* Reviewer Metrics */}
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">Reviewer</p>
                                <div className="flex gap-2 text-sm">
                                    <span className="font-medium">{metadata.jumlah_negara_reviewer}</span>
                                    <span className="text-muted-foreground">negara</span>
                                </div>
                                <div className="flex gap-2 text-sm">
                                    <span className="font-medium">{metadata.jumlah_institusi_reviewer}</span>
                                    <span className="text-muted-foreground">institusi</span>
                                </div>
                            </div>

                            {/* Author Metrics (Optional) */}
                            {(metadata.jumlah_negara_author !== null && metadata.jumlah_negara_author !== undefined) && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium">Author</p>
                                    <div className="flex gap-2 text-sm">
                                        <span className="font-medium">{metadata.jumlah_negara_author}</span>
                                        <span className="text-muted-foreground">negara</span>
                                    </div>
                                    {metadata.jumlah_institusi_author !== null && (
                                        <div className="flex gap-2 text-sm">
                                            <span className="font-medium">{metadata.jumlah_institusi_author}</span>
                                            <span className="text-muted-foreground">institusi</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!readOnly && (
                        <div className="flex items-start gap-1 flex-shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onEdit}
                                className="h-8 w-8"
                                title="Edit"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onDelete}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
