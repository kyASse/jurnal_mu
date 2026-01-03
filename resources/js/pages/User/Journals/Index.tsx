import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Edit,
    Trash2,
    BookOpen,
    ExternalLink,
} from 'lucide-react';

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string;
    url: string;
    university: {
        name: string;
    };
    scientific_field: {
        name: string;
    };
    sinta_rank: number | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    journals: {
        data: Journal[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>
    };
}

export default function JournalsIndex({ journals }: Props) {
    const { flash } = usePage().props as any;

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Are you sure you want to delete ${title}?`)) {
            router.delete(route('journals.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="My Journals" />

            <div className='py-6'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    {/* Header */}
                    <div className='mb-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
                                    <BookOpen className='w-8 h-8 text-blue-600' />
                                    My Journals
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage journals that you are responsible for
                                </p>
                            </div>
                            <Link href={route('journals.create')}>
                                <Button className='flex items-center gap-2'>
                                    <Plus className='w-4 h-4' />
                                    Add New Journal
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                            {flash.error}
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Journal Info</TableHead>
                                    <TableHead>ISSN</TableHead>
                                    <TableHead>Scientific Field</TableHead>
                                    <TableHead>SINTA</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journals.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No journals found. Click "Add New Journal" to start.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journals.data.map((journal) => (
                                        <TableRow key={journal.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{journal.title}</span>
                                                    <a 
                                                        href={journal.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    >
                                                        Visit Website <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {journal.issn && <div>Print: {journal.issn}</div>}
                                                    {journal.e_issn && <div>Elec: {journal.e_issn}</div>}
                                                    {!journal.issn && !journal.e_issn && <span className="text-gray-400">-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {journal.scientific_field?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {journal.sinta_rank ? (
                                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                                        SINTA {journal.sinta_rank}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Not Indexed</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('journals.edit', journal.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(journal.id, journal.title)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
