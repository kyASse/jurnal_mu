import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Paperclip, Send, ArrowLeft, RefreshCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminShow({ ticket }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Support Tickets', href: route('admin.tickets.index') },
        { title: `Ticket #${ticket.id}`, href: route('admin.tickets.show', ticket.id) },
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'open': return 'destructive';
            case 'in_progress': return 'warning';
            case 'resolved': return 'success';
            case 'closed': return 'secondary';
            default: return 'default';
        }
    };

    const { data: statusData, setData: setStatusData, patch, processing: updatingStatus } = useForm({
        status: ticket.status,
    });

    const { data: replyData, setData: setReplyData, post, processing: sendingReply, reset: resetReply, errors: replyErrors } = useForm({
        message: '',
        attachment: null as File | null,
    });

    const submitStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.tickets.update-status', ticket.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Ticket status updated successfully.'),
        });
    };

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.tickets.reply', ticket.id), {
            onSuccess: () => {
                resetReply();
                toast.success('Reply submitted.');
                // Status auto-updates to in_progress in backend, sync form state
                setStatusData('status', 'in_progress');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ticket #${ticket.id} - Admin`} />
            
            <div className="flex flex-col gap-6 p-4 lg:p-6 mx-auto w-full max-w-6xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">#{ticket.id} {ticket.subject}</h1>
                            <p className="text-sm text-muted-foreground mt-1">Manage ticket and respond to user.</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <Card className="h-full flex flex-col flex-1">
                            <CardHeader className="border-b px-4 py-3">
                                <CardTitle className="text-base flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2" /> Conversation history
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 flex flex-col">
                                <ScrollArea className="flex-1 p-4 max-h-[500px] min-h-[300px]">
                                    <div className="space-y-6">
                                        {ticket.messages.map((msg: any) => (
                                            <div key={msg.id} className={`flex flex-col ${msg.user.id !== ticket.user_id ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[85%] rounded-lg p-4 ${
                                                    msg.user.id !== ticket.user_id 
                                                        ? 'bg-primary text-primary-foreground' 
                                                        : 'bg-muted text-foreground'
                                                }`}>
                                                    <div className="flex items-center gap-2 mb-2 opacity-80 text-xs font-semibold">
                                                        <span>{msg.user.name}</span>
                                                        {msg.user.id !== ticket.user_id && <Badge variant="secondary" className="scale-75">Admin</Badge>}
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

                                <div className="p-4 border-t bg-muted/30">
                                    <form onSubmit={submitReply} className="flex flex-col gap-3">
                                        <Textarea 
                                            value={replyData.message} 
                                            onChange={e => setReplyData('message', e.target.value)}
                                            placeholder="Write your response to the user..." 
                                            className="min-h-[100px] resize-none"
                                        />
                                        {replyErrors.message && <div className="text-xs text-red-500">{replyErrors.message}</div>}
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="relative"
                                                    onClick={() => document.getElementById('admin-reply-attachment')?.click()}
                                                >
                                                    <Paperclip className="w-4 h-4 mr-2" />
                                                    {replyData.attachment ? replyData.attachment.name : 'Attach File'}
                                                </Button>
                                                <input 
                                                    id="admin-reply-attachment" 
                                                    type="file" 
                                                    className="hidden" 
                                                    onChange={e => setReplyData('attachment', e.target.files ? e.target.files[0] : null)} 
                                                />
                                            </div>
                                            <Button type="submit" disabled={sendingReply || !replyData.message.trim()}>
                                                <Send className="w-4 h-4 mr-2" /> Send Reply
                                            </Button>
                                        </div>
                                        {replyErrors.attachment && <div className="text-xs text-red-500 mt-1">{replyErrors.attachment}</div>}
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 flex flex-col gap-4">
                        {/* Status Update Panel */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Manage Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitStatusUpdate} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Update Ticket Status</label>
                                        <Select value={statusData.status} onValueChange={v => setStatusData('status', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" variant="secondary" className="w-full" disabled={updatingStatus || statusData.status === ticket.status}>
                                        <RefreshCcw className="w-4 h-4 mr-2" /> Change Status
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Ticket Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block mb-1">Reporter</span>
                                    <p className="font-medium text-base">{ticket.user.name}</p>
                                    <p className="text-muted-foreground text-xs">{ticket.user.email}</p>
                                </div>
                                <hr />
                                <div>
                                    <span className="text-muted-foreground block mb-1">Ticket Status</span>
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
