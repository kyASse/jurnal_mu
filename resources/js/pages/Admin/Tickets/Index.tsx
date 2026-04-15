import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manage Support Tickets', href: route('admin.tickets.index') },
];

export default function AdminIndex({ tickets, filters }: any) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'open': return 'destructive';
            case 'in_progress': return 'warning';
            case 'resolved': return 'success';
            case 'closed': return 'secondary';
            default: return 'default';
        }
    };

    const handleFilterChange = (status: string) => {
        router.get(route('admin.tickets.index'), {
            status: status !== 'all' ? status : undefined
        }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Tickets" />

            <div className="flex flex-col gap-6 p-4 lg:p-6">
                <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
                        <p className="text-muted-foreground mt-1">Review and reply to user bug reports and support requests.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={filters?.status || 'all'} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Tickets" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tickets</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platform Tickets</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tickets.total}</div>
                            <p className="text-xs text-muted-foreground">Total records in system</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Tickets</CardTitle>
                        <CardDescription>A comprehensive list of user tickets and their statuses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tickets.data.length === 0 ? (
                            <div className="text-center py-10">
                                <h3 className="text-lg font-medium text-muted-foreground">No tickets found</h3>
                                <p className="text-sm text-muted-foreground mt-1">There are no tickets matching your criteria.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket ID</TableHead>
                                        <TableHead>User / Reporter</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.data.map((ticket: any) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-medium">#{ticket.id}</TableCell>
                                            <TableCell>{ticket.user.name}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                                            <TableCell className="capitalize">{ticket.category.replace('_', ' ')}</TableCell>
                                            <TableCell className="capitalize">{ticket.priority}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(ticket.status)}>
                                                    {ticket.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => router.visit(route('admin.tickets.show', ticket.id))}>
                                                    <Eye className="w-4 h-4 mr-2" /> Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
