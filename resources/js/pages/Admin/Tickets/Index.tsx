import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Eye } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manage Support Tickets', href: route('admin.tickets.index') },
];

export default function AdminIndex({ tickets, filters }: any) {
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

    const handleFilterChange = (status: string) => {
        router.get(
            route('admin.tickets.index'),
            {
                status: status !== 'all' ? status : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Tickets" />

            <div className="flex flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
                        <p className="mt-1 text-muted-foreground">Review and reply to user bug reports and support requests.</p>
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                            <div className="py-10 text-center">
                                <h3 className="text-lg font-medium text-muted-foreground">No tickets found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">There are no tickets matching your criteria.</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden overflow-x-auto md:block">
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
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(ticket.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.visit(route('admin.tickets.show', ticket.id))}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" /> Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="grid grid-cols-1 gap-4 md:hidden">
                                    {tickets.data.map((ticket: any) => (
                                        <div key={ticket.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                                                        #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}
                                                    </span>
                                                    <h4 className="line-clamp-2 text-sm font-medium">{ticket.subject}</h4>
                                                    <p className="mt-1 text-xs text-muted-foreground">By: {ticket.user.name}</p>
                                                </div>
                                                <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                                            </div>
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                                <Badge variant="secondary" className="capitalize">
                                                    {ticket.category.replace('_', ' ')}
                                                </Badge>
                                                <Badge variant="default" className="capitalize">
                                                    {ticket.priority} Priority
                                                </Badge>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 w-full"
                                                onClick={() => router.visit(route('admin.tickets.show', ticket.id))}
                                            >
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
