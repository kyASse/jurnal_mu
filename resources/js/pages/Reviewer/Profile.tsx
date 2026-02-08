/**
 * Reviewer Profile Edit Component
 *
 * @description
 * Self-service profile editor for reviewers. Allows reviewers to update their expertise and biography.
 * Note: max_assignments is admin-only and cannot be changed by reviewers.
 *
 * @route GET /reviewer/profile
 * @features Update own expertise, bio (read-only: max_assignments)
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ScientificField, type User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Award, Info, Save } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/reviewer/dashboard' },
    { title: 'Profile', href: '#' },
];

interface Props {
    reviewer: User;
    scientificFields: ScientificField[];
}

export default function ReviewerProfile({ reviewer, scientificFields }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        reviewer_expertise: reviewer.reviewer_expertise || [],
        reviewer_bio: reviewer.reviewer_bio || '',
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

        put('/reviewer/profile', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile updated successfully');
            },
            onError: () => {
                toast.error('Failed to update profile');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">My Reviewer Profile</h1>
                        <p className="text-sm text-muted-foreground">Manage your expertise and professional information</p>
                    </div>
                    <Link href="/reviewer/dashboard">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Profile Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Your basic profile details</CardDescription>
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
                                    <Badge className="mt-2 bg-purple-600">
                                        <Award className="mr-1 h-3 w-3" />
                                        Reviewer
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Biography */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Biography</CardTitle>
                            <CardDescription>Tell us about your professional background and research interests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="reviewer_bio">Biography</Label>
                                <Textarea
                                    id="reviewer_bio"
                                    value={data.reviewer_bio}
                                    onChange={(e) => setData('reviewer_bio', e.target.value)}
                                    placeholder="Describe your professional background, qualifications, and research interests..."
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
                            <CardDescription>Select scientific fields you specialize in for coaching assignments</CardDescription>
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

                    {/* Capacity Settings (Read-only) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Capacity</CardTitle>
                            <CardDescription>Your current workload settings (managed by admin)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
                                    <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">Maximum Concurrent Assignments</p>
                                        <p className="mt-1 text-2xl font-bold text-purple-600">{reviewer.max_assignments || 5}</p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            This setting is managed by your university admin. Contact them to adjust your capacity.
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Current Assignments</span>
                                        <span className="text-lg font-bold text-foreground">
                                            {reviewer.current_assignments || 0} / {reviewer.max_assignments || 5}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between">
                        <Link href="/reviewer/dashboard">
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
