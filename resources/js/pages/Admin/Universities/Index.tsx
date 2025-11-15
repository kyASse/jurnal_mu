import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Building2,
    Users,
    BookOpen,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface University {
    id: number;
    code: string;
    name: string;
    short_name: string;
    city: string;
    province: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
    is_active: boolean;
    users_count: number;
    journals_count: number;
    full_address: string;
    created_at: string;
}

interface Props {
    universities: {
        data: University[];
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
    filters: {
        search: string;
        is_active: string;
    };
    can: {
        create: boolean;
    };
}

export default function UniversitiesIndex({ universities, filters, can}: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [isActiveFilter, setIsActiveFilter] = useState(filters.is_active || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.universities.index'),
            { search, is_active: isActiveFilter },
            { preserveState: true }
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            router.delete(
                route('admin.universities.destroy', id)
            )
        }
    };

    const handleToggleActive = (id: number) => {
        router.post(
            route('admin.universities.toggle-active', id),
        )
    };

    return (
        <>
        <Head title="Universities" />

        <div className='py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
                                <Building2 className='w-8 h-8 text-green-600' />
                                Universities Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage Perguruan Tinggi Muhammadiyah
                            </p>
                        </div>
                        {can.create && (
                            <Link href={route('admin.universities.create')}>
                                <Button className='flex items-center gap-2'>
                                    <Plus className='w-4 h-4' />
                                    Add University
                                </Button>
                            </Link>
                        )}
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

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, code, or city..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <select
                            value={isActiveFilter}
                            onChange={(e) => setIsActiveFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">All Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                        <Button type="submit">Search</Button>
                        {(search || isActiveFilter) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    setIsActiveFilter('');
                                    router.get(route('admin.universities.index'));
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Users
                                </TableHead>
                                <TableHead className="text-center">
                                    <BookOpen className="w-4 h-4 inline mr-1" />
                                    Journals
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {universities.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        No universities found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                universities.data.map((university) => (
                                    <TableRow key={university.id}>
                                        <TableCell className="font-medium">
                                            {university.code}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {university.name}
                                                </div>
                                                {university.short_name && (
                                                    <div className="text-sm text-gray-500">
                                                        {university.short_name}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {university.city && university.province ? (
                                                    <>
                                                        {university.city}, {university.province}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {university.is_active ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {university.users_count}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {university.journals_count}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('admin.universities.show', university.id)}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {can.create && (
                                                    <>
                                                        <Link href={route('admin.universities.edit', university.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(university.id, university.name)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {universities.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {((universities.current_page - 1) * universities.per_page) + 1} to{' '}
                                    {Math.min(universities.current_page * universities.per_page, universities.total)} of{' '}
                                    {universities.total} results
                                </div>
                                <div className="flex items-center gap-2">
                                    {universities.links.map((link, index) => {
                                        if (link.url === null) return null;
                                        
                                        const isFirst = index === 0;
                                        const isLast = index === universities.links.length - 1;
                                        
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                preserveState
                                                preserveScroll
                                            >
                                                <Button
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                >
                                                    {isFirst ? (
                                                        <ChevronLeft className="w-4 h-4" />
                                                    ) : isLast ? (
                                                        <ChevronRight className="w-4 h-4" />
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    )
}