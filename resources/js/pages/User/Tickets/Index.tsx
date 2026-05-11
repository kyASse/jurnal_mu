import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Eye, PlusCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Support Tickets', href: route('user.tickets.index') },
];

export default function Index({ tickets }: any) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support Tickets" />

            <div className="flex flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
                        <p className="mt-1 text-muted-foreground">Manage and track your support requests and bug reports.</p>
                    </div>
                    <Button className="w-full sm:w-auto" onClick={() => router.visit(route('user.tickets.create'))}>
                        <PlusCircle className="mr-2 h-4 w-4" />
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
                            <div className="py-10 text-center">
                                <h3 className="text-lg font-medium text-muted-foreground">No tickets found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">You haven't created any support tickets yet.</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden overflow-x-auto md:block">
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
                                                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.visit(route('user.tickets.show', ticket.id))}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" /> View
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
                                                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">#{ticket.id}</span>
                                                    <h4 className="line-clamp-2 text-sm font-medium">{ticket.subject}</h4>
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
                                                onClick={() => router.visit(route('user.tickets.show', ticket.id))}
                                            >
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {/* Pagination links here if necessary */}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
