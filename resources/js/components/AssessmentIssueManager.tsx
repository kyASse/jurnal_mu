import { AssessmentIssue } from '@/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import IssueCard from './IssueCard';
import IssueFormDialog from './IssueFormDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AssessmentIssueManagerProps {
    issues: AssessmentIssue[];
    onChange: (issues: AssessmentIssue[]) => void;
    readOnly?: boolean;
}

export default function AssessmentIssueManager({
    issues = [],
    onChange,
    readOnly = false,
}: AssessmentIssueManagerProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingIssue, setEditingIssue] = useState<AssessmentIssue | null>(null);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
    const [mode, setMode] = useState<'create' | 'edit'>('create');

    const handleAddIssue = (
        issueData: Omit<
            AssessmentIssue,
            'id' | 'journal_assessment_id' | 'created_at' | 'updated_at' | 'display_order'
        >
    ) => {
        const newIssue: AssessmentIssue = {
            ...issueData,
            id: Date.now(), // Temporary ID for frontend
            journal_assessment_id: 0, // Will be set on backend
            display_order: issues.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        onChange([...issues, newIssue]);
    };

    const handleEditIssue = (
        issueData: Omit<
            AssessmentIssue,
            'id' | 'journal_assessment_id' | 'created_at' | 'updated_at' | 'display_order'
        >
    ) => {
        if (!editingIssue) return;

        const updatedIssues = issues.map((issue) =>
            issue.id === editingIssue.id
                ? {
                      ...issue,
                      ...issueData,
                      updated_at: new Date().toISOString(),
                  }
                : issue
        );

        onChange(updatedIssues);
        setEditingIssue(null);
    };

    const handleDeleteIssue = () => {
        if (deletingIndex === null) return;

        const updatedIssues = issues.filter((_, index) => index !== deletingIndex);
        onChange(updatedIssues);
        setDeletingIndex(null);
        setDeleteDialogOpen(false);
    };

    const openAddDialog = () => {
        setMode('create');
        setEditingIssue(null);
        setDialogOpen(true);
    };

    const openEditDialog = (issue: AssessmentIssue) => {
        setMode('edit');
        setEditingIssue(issue);
        setDialogOpen(true);
    };

    const openDeleteDialog = (index: number) => {
        setDeletingIndex(index);
        setDeleteDialogOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Catatan Masalah</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {readOnly
                                    ? 'Masalah yang ditemukan dalam assessment'
                                    : 'Catat masalah atau kelemahan yang ditemukan pada jurnal'}
                            </p>
                        </div>
                        {!readOnly && (
                            <Button onClick={openAddDialog} size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Masalah
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {issues.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground mb-2">
                                {readOnly
                                    ? 'Tidak ada masalah yang dicatat'
                                    : 'Belum ada masalah yang dicatat'}
                            </p>
                            {!readOnly && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    Tambahkan masalah untuk dokumentasi lengkap
                                </p>
                            )}
                            {!readOnly && (
                                <Button onClick={openAddDialog} variant="outline" size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Masalah Pertama
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {issues.map((issue, index) => (
                                <IssueCard
                                    key={issue.id}
                                    issue={issue}
                                    readOnly={readOnly}
                                    onEdit={() => openEditDialog(issue)}
                                    onDelete={() => openDeleteDialog(index)}
                                />
                            ))}
                        </div>
                    )}

                    {!readOnly && issues.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Total: <span className="font-medium">{issues.length}</span>{' '}
                                {issues.length === 1 ? 'masalah' : 'masalah'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <IssueFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={mode === 'edit' ? handleEditIssue : handleAddIssue}
                issue={editingIssue}
                mode={mode}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Issue?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Issue ini akan dihapus secara permanen. Tindakan ini tidak dapat
                            dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteIssue}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
