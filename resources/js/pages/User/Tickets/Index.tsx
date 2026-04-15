import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Support Tickets', href: route('user.tickets.index') },
];

export default function Index({ tickets }: any) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'open': return 'destructive';
            case 'in_progress': return 'warning';
            case 'resolved': return 'success';
            case 'closed': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support Tickets" />

            <div className="flex flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
                        <p className="text-muted-foreground mt-1">Manage and track your support requests and bug reports.</p>
                    </div>
                    <Button onClick={() => router.visit(route('user.tickets.create'))}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Ticket
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Tickets</CardTitle>
                        <CardDescription>A list of all tickets you have submitted.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tickets.data.length === 0 ? (
                            <div className="text-center py-10">
                                <h3 className="text-lg font-medium text-muted-foreground">No tickets found</h3>
                                <p className="text-sm text-muted-foreground mt-1">You haven't created any support tickets yet.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket ID</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.data.map((ticket: any) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-medium">#{ticket.id}</TableCell>
                                            <TableCell>{ticket.subject}</TableCell>
                                            <TableCell className="capitalize">{ticket.category.replace('_', ' ')}</TableCell>
                                            <TableCell className="capitalize">{ticket.priority}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(ticket.status)}>
                                                    {ticket.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => router.visit(route('user.tickets.show', ticket.id))}>
                                                    <Eye className="w-4 h-4 mr-2" /> View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {/* Pagination links here if necessary */}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
