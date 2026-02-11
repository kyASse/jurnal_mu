/**
 * JournalsIndex Component
 *
 * @description
 * The main journal management dashboard for users. It displays a comprehensive list
 * of journals that the user is responsible for. This page allows users to view,
 * search, manage and track the status of their journals. It serves as the
 * central hub for all journal-related operations.
 *
 * @component
 *
 * @interface Journal
 * @property {number} id - Unique identifier for the journal
 * @property {string} title - The title of the journal
 * @property {string} issn - International Standard Serial Number (Print)
 * @property {string} e_issn - Electronic ISSN
 * @property {string} url - Website URL of the journal
 * @property {Object} university - Associated university data
 * @property {string} university.name - University name
 * @property {Object} scientific_field - Field of science data
 * @property {string} scientific_field.name - Name of the field
 * @property {number|null} sinta_rank - SINTA accreditation rank (1-6)
 * @property {boolean} is_active - Active status of the journal
 * @property {string} created_at - Creation timestamp
 *
 * @interface Props
 * @property {Object} journals - Paginated response of journals
 * @property {Journal[]} journals.data - Array of journal records
 * @property {number} journals.current_page - Current page number
 * @property {number} journals.last_page - Last page number
 * @property {number} journals.per_page - Items per page
 * @property {number} journals.total - Total items
 * @property {Array} journals.links - Pagination links
 *
 * @param {Props} props - Component props
 * @param {Object} props.journals - The journals data passed from the controller
 *
 * @returns {JSX.Element} The rendered Journals Index page
 *
 * @example
 * ```tsx
 * <JournalsIndex journals={paginatedJournals} />
 * ```
 *
 * @features
 * - List view of all user's journals
 * - Pagination support
 * - Delete functionality with confirmation
 * - Direct links to Edit and Create pages
 * - External link to journal website
 * - Status indicators (SINTA rank)
 * - Flash message display
 *
 * @route GET /journals
 *
 * @requires @inertiajs/react
 * @requires @/layouts/app-layout
 * @requires @/components/ui/button
 * @requires @/components/ui/table
 * @requires @/components/ui/badge
 * @requires lucide-react
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/User/Journals/Index.tsx
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Edit, ExternalLink, Plus, Trash2 } from 'lucide-react';

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
        }>;
    };
}

export default function JournalsIndex({ journals }: Props) {
    const { flash } = usePage<SharedData>().props;

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Are you sure you want to delete ${title}?`)) {
            router.delete(route('user.journals.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="My Journals" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
                                    <BookOpen className="h-8 w-8 text-blue-600" />
                                    My Journals
                                </h1>
                                <p className="mt-1 text-gray-600">Manage journals that you are responsible for</p>
                            </div>
                            <Link href={route('user.journals.create')}>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New Journal
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{flash.success}</div>}
                    {flash?.error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{flash.error}</div>}

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
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
                                        <TableCell colSpan={5} className="py-8 text-center text-gray-500">
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
                                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        Visit Website <ExternalLink className="h-3 w-3" />
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
                                            <TableCell>{journal.scientific_field?.name || '-'}</TableCell>
                                            <TableCell>
                                                {journal.sinta_rank ? (
                                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">SINTA {journal.sinta_rank}</Badge>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Not Indexed</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('user.journals.edit', journal.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(journal.id, journal.title)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
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
