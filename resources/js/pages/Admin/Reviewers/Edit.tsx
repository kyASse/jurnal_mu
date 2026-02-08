/**
 * Admin Reviewer Edit Component
 *
 * @description
 * Form to edit reviewer profile: expertise, biography, and maximum assignments.
 *
 * @route GET /admin/reviewers/{id}/edit
 * @features Update expertise, bio, max_assignments
 */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ScientificField, type User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Award, Save, X } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'User Management', href: '#' },
    { title: 'Reviewers', href: '/admin/reviewers' },
    { title: 'Edit', href: '#' },
];

interface Props {
    reviewer: User;
    scientificFields: ScientificField[];
    _expertiseFields: ScientificField[];
}

export default function ReviewerEdit({ reviewer, scientificFields, _expertiseFields }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        reviewer_expertise: reviewer.reviewer_expertise || [],
        reviewer_bio: reviewer.reviewer_bio || '',
        max_assignments: reviewer.max_assignments || 5,
    });

    const handleExpertiseToggle = (fieldId: number) => {
        const currentExpertise = data.reviewer_expertise;
        if (currentExpertise.includes(fieldId)) {
            setData('reviewer_expertise', currentExpertise.filter((id) => id !== fieldId));
        } else {
            setData('reviewer_expertise', [...currentExpertise, fieldId]);
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        put(`/admin/reviewers/${reviewer.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reviewer profile updated successfully');
            },
            onError: () => {
                toast.error('Failed to update reviewer profile');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Reviewer: ${reviewer.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Edit Reviewer Profile</h1>
                        <p className="text-sm text-muted-foreground">Update expertise, biography, and capacity settings</p>
                    </div>
                    <Link href={`/admin/reviewers/${reviewer.id}`}>
                        <Button variant="outline">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Reviewer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Reviewer Information</CardTitle>
                            <CardDescription>Basic details about the reviewer</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                {reviewer.avatar_url ? (
                                    <img src={reviewer.avatar_url} alt={reviewer.name} className="h-16 w-16 rounded-full" />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                        {reviewer.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-foreground">{reviewer.name}</h3>
                                    <p className="text-sm text-muted-foreground">{reviewer.email}</p>
                                    {reviewer.university && <p className="text-sm text-muted-foreground">{reviewer.university.name}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Biography */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Biography</CardTitle>
                            <CardDescription>Professional background and qualifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="reviewer_bio">Biography (Optional)</Label>
                                <Textarea
                                    id="reviewer_bio"
                                    value={data.reviewer_bio}
                                    onChange={(e) => setData('reviewer_bio', e.target.value)}
                                    placeholder="Enter reviewer's professional background, qualifications, research interests..."
                                    rows={5}
                                    maxLength={1000}
                                    className="resize-none"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{errors.reviewer_bio && <span className="text-red-600">{errors.reviewer_bio}</span>}</span>
                                    <span>
                                        {data.reviewer_bio.length} / 1000 characters
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expertise */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Areas of Expertise
                            </CardTitle>
                            <CardDescription>Select scientific fields this reviewer specializes in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                                {scientificFields.map((field) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`field-${field.id}`}
                                            checked={data.reviewer_expertise.includes(field.id)}
                                            onCheckedChange={() => handleExpertiseToggle(field.id)}
                                        />
                                        <label
                                            htmlFor={`field-${field.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {field.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {errors.reviewer_expertise && <p className="mt-2 text-sm text-red-600">{errors.reviewer_expertise}</p>}
                            <p className="mt-3 text-sm text-muted-foreground">
                                {data.reviewer_expertise.length} field{data.reviewer_expertise.length !== 1 ? 's' : ''} selected
                            </p>
                        </CardContent>
                    </Card>

                    {/* Capacity Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Capacity Settings</CardTitle>
                            <CardDescription>Configure maximum concurrent assignments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="max_assignments">Maximum Concurrent Assignments</Label>
                                <Input
                                    id="max_assignments"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={data.max_assignments}
                                    onChange={(e) => setData('max_assignments', parseInt(e.target.value) || 5)}
                                    className="w-32"
                                />
                                {errors.max_assignments && <p className="text-sm text-red-600">{errors.max_assignments}</p>}
                                <p className="text-sm text-muted-foreground">
                                    Current workload: {reviewer.current_assignments || 0} active assignments
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between">
                        <Link href={`/admin/reviewers/${reviewer.id}`}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
