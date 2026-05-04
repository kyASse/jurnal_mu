import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Paperclip, Send, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function Show({ ticket }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Support Tickets', href: route('user.tickets.index') },
        { title: `Ticket #${ticket.id}`, href: route('user.tickets.show', ticket.id) },
    ];

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'open': return 'destructive';
            case 'in_progress': return 'default';
            case 'resolved': return 'outline';
            case 'closed': return 'secondary';
            default: return 'default';
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
            
            <div className="flex flex-col gap-6 p-4 lg:p-6 mx-auto w-full max-w-5xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">#{ticket.id} {ticket.subject}</h1>
                        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground mt-1">
                            <span className="capitalize">Category: {ticket.category.replace('_', ' ')}</span>
                            <span>&bull;</span>
                            <span className="capitalize">Priority: {ticket.priority}</span>
                            <span>&bull;</span>
                            <Badge variant={getStatusVariant(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse md:grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 flex flex-col gap-4">
                        <Card className="h-full flex flex-col flex-1">
                            <CardHeader className="border-b px-4 py-3">
                                <CardTitle className="text-base flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2" /> Conversation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 flex flex-col">
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-6">
                                        {ticket.messages.map((msg: any) => (
                                            <div key={msg.id} className={`flex flex-col ${msg.user.id === ticket.user_id ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[85%] rounded-lg p-4 ${
                                                    msg.user.id === ticket.user_id 
                                                        ? 'bg-primary text-primary-foreground' 
                                                        : 'bg-muted text-foreground'
                                                }`}>
                                                    <div className="flex items-center gap-2 mb-2 opacity-80 text-xs font-semibold">
                                                        <span>{msg.user.name}</span>
                                                        <span>{new Date(msg.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                                    {msg.attachment_path && (
                                                        <div className="mt-3 pt-3 border-t border-primary-foreground/20">
                                                            <a 
                                                                href={`/storage/${msg.attachment_path}`} 
                                                                target="_blank" 
                                                                className="flex items-center gap-2 text-xs font-medium hover:underline"
                                                            >
                                                                <Paperclip className="w-3 h-3" />
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
                                    <div className="p-4 border-t bg-muted/30">
                                        <form onSubmit={submitReply} className="flex flex-col gap-3">
                                            <Textarea 
                                                value={data.message} 
                                                onChange={e => setData('message', e.target.value)}
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
                                                        <Paperclip className="w-4 h-4 mr-2" />
                                                        {data.attachment ? data.attachment.name : 'Attach File'}
                                                    </Button>
                                                    <input 
                                                        id="reply-attachment" 
                                                        type="file" 
                                                        className="hidden" 
                                                        onChange={e => setData('attachment', e.target.files ? e.target.files[0] : null)} 
                                                    />
                                                </div>
                                                <Button className="w-full sm:w-auto" type="submit" disabled={processing || !data.message.trim()}>
                                                    <Send className="w-4 h-4 mr-2" /> Send Reply
                                                </Button>
                                            </div>
                                            {errors.attachment && <div className="text-xs text-red-500 mt-1">{errors.attachment}</div>}
                                        </form>
                                    </div>
                                ) : (
                                    <div className="p-4 border-t text-center text-muted-foreground text-sm">
                                        This ticket has been closed. You cannot reply to a closed ticket.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-1 space-y-4">
                        {/* Summary / Info Panel on the side */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Ticket Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block mb-1">Status</span>
                                    <Badge variant={getStatusVariant(ticket.status)}>
                                        {ticket.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Category</span>
                                    <p className="capitalize font-medium">{ticket.category.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Priority</span>
                                    <p className="capitalize font-medium">{ticket.priority}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Created At</span>
                                    <p className="font-medium">{new Date(ticket.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Reporter</span>
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
