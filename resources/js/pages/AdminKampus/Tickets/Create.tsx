import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Support Tickets', href: route('admin-kampus.tickets.index') },
    { title: 'Create', href: route('admin-kampus.tickets.create') },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        category: 'bug_report',
        priority: 'normal',
        message: '',
        attachment: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin-kampus.tickets.store'), {
            onSuccess: () => {
                toast.success('Ticket created successfully', {
                    description: 'The support team will review your request shortly.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Ticket" />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">Create a Support Ticket</h1>
                    <p className="text-muted-foreground">Please provide details about the issue or request.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ticket Details</CardTitle>
                        <CardDescription>Fill out the form below to submit a new ticket.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="Summary of the issue"
                                    required
                                />
                                {errors.subject && <div className="text-sm text-red-500">{errors.subject}</div>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bug_report">Bug Report</SelectItem>
                                            <SelectItem value="question">Question</SelectItem>
                                            <SelectItem value="feature_request">Feature Request</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <div className="text-sm text-red-500">{errors.category}</div>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Select Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && <div className="text-sm text-red-500">{errors.priority}</div>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    required
                                    rows={6}
                                    placeholder="Describe the issue in detail..."
                                />
                                {errors.message && <div className="text-sm text-red-500">{errors.message}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="attachment">Attachment (Optional)</Label>
                                <Input
                                    id="attachment"
                                    type="file"
                                    onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)}
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip"
                                />
                                <p className="text-xs text-muted-foreground">Allowed types: jpg, png, pdf, doc, zip (Max: 5MB)</p>
                                {errors.attachment && <div className="text-sm text-red-500">{errors.attachment}</div>}
                            </div>

                            <div className="flex flex-col justify-end gap-4 sm:flex-row">
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    Submit Ticket
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
