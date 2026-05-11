import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, MessageSquare, Paperclip, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Show({ ticket }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Support Tickets', href: route('user.tickets.index') },
        { title: `Ticket #${ticket.id}`, href: route('user.tickets.show', ticket.id) },
    ];

    const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status) {
            case 'open':
                return 'default';
            case 'in_progress':
                return 'secondary';
            case 'resolved':
                return 'outline';
            case 'closed':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
        attachment: null as File | null,
    });

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user.tickets.reply', ticket.id), {
            onSuccess: () => {
                reset();
                toast.success('Reply submitted');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ticket #${ticket.id}`} />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            #{ticket.id} {ticket.subject}
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">Category: {ticket.category.replace('_', ' ')}</span>
                            <span>&bull;</span>
                            <span className="capitalize">Priority: {ticket.priority}</span>
                            <span>&bull;</span>
                            <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-3">
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <Card className="flex h-full flex-1 flex-col">
                            <CardHeader className="border-b px-4 py-3">
                                <CardTitle className="flex items-center text-base">
                                    <MessageSquare className="mr-2 h-4 w-4" /> Conversation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col p-0">
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-6">
                                        {ticket.messages.map((msg: any) => (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${msg.user.id === ticket.user_id ? 'items-end' : 'items-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-lg p-4 ${
                                                        msg.user.id === ticket.user_id
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-foreground'
                                                    }`}
                                                >
                                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold opacity-80">
                                                        <span>{msg.user.name}</span>
                                                        <span>{new Date(msg.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                    {msg.attachment_path && (
                                                        <div className="mt-3 border-t border-primary-foreground/20 pt-3">
                                                            <a
                                                                href={`/storage/${msg.attachment_path}`}
                                                                target="_blank"
                                                                className="flex items-center gap-2 text-xs font-medium hover:underline"
                                                            >
                                                                <Paperclip className="h-3 w-3" />
                                                                View Attachment
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {ticket.status !== 'closed' ? (
                                    <div className="border-t bg-muted/30 p-4">
                                        <form onSubmit={submitReply} className="flex flex-col gap-3">
                                            <Textarea
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                placeholder="Type your reply here..."
                                                className="min-h-[100px] resize-none"
                                            />
                                            {errors.message && <div className="text-xs text-red-500">{errors.message}</div>}

                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="relative"
                                                        onClick={() => document.getElementById('reply-attachment')?.click()}
                                                    >
                                                        <Paperclip className="mr-2 h-4 w-4" />
                                                        {data.attachment ? data.attachment.name : 'Attach File'}
                                                    </Button>
                                                    <input
                                                        id="reply-attachment"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)}
                                                    />
                                                </div>
                                                <Button className="w-full sm:w-auto" type="submit" disabled={processing || !data.message.trim()}>
                                                    <Send className="mr-2 h-4 w-4" /> Send Reply
                                                </Button>
                                            </div>
                                            {errors.attachment && <div className="mt-1 text-xs text-red-500">{errors.attachment}</div>}
                                        </form>
                                    </div>
                                ) : (
                                    <div className="border-t p-4 text-center text-sm text-muted-foreground">
                                        This ticket has been closed. You cannot reply to a closed ticket.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4 md:col-span-1">
                        {/* Summary / Info Panel on the side */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Ticket Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <span className="mb-1 block text-muted-foreground">Status</span>
                                    <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                                </div>
                                <div>
                                    <span className="mb-1 block text-muted-foreground">Category</span>
                                    <p className="font-medium capitalize">{ticket.category.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <span className="mb-1 block text-muted-foreground">Priority</span>
                                    <p className="font-medium capitalize">{ticket.priority}</p>
                                </div>
                                <div>
                                    <span className="mb-1 block text-muted-foreground">Created At</span>
                                    <p className="font-medium">{new Date(ticket.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="mb-1 block text-muted-foreground">Reporter</span>
                                    <p className="font-medium">{ticket.user.name}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
