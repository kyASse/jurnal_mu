import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    Trash2,
    MapPin,
    Phone,
    Mail,
    Globe,
    Users,
    BookOpen,
    Calendar,
} from 'lucide-react';

interface University {
    id: number;
    code: string;
    name: string;
    short_name: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
    is_active: boolean;
    full_address: string;
    created_at: string;
    updated_at: string;
    users_count: number;
    journals_count: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
}

interface Props {
    university: University;
    users: User[];
    journals: Journal[];
    can: {
        update: boolean;
        delete: boolean;
    };
}

export default function UniversitiesShow({ university, users, journals, can }: Props) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${university.name}?`)) {
            router.delete(route('admin.universities.destroy', university.id));
        }
    };

    return (
        <>
            <Head title={university.name} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.universities.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>

                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                {university.logo_url && (
                                    <img
                                        src={university.logo_url}
                                        alt={university.name}
                                        className="w-20 h-20 object-contain rounded-lg border"
                                    />
                                )}
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {university.name}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Badge variant="outline" className="font-mono">
                                            {university.code}
                                        </Badge>
                                        {university.is_active ? (
                                            <Badge className="bg-green-100 text-green-800">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {(can.update || can.delete) && (
                                <div className="flex gap-2">
                                    {can.update && (
                                        <Link href={route('admin.universities.edit', university.id)}>
                                            <Button>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                    )}
                                    {can.delete && (
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Contact Information
                                </h2>
                                <div className="space-y-3">
                                    {university.full_address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Address</div>
                                                <div className="text-gray-900">{university.full_address}</div>
                                            </div>
                                        </div>
                                    )}

                                    {university.phone && (
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Phone</div>
                                                <a href={`tel:${university.phone}`} className="text-green-600 hover:underline">
                                                    {university.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {university.email && (
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Email</div>
                                                <a href={`mailto:${university.email}`} className="text-green-600 hover:underline">
                                                    {university.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {university.website && (
                                        <div className="flex items-start gap-3">
                                            <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Website</div>
                                                <a
                                                    href={university.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:underline"
                                                >
                                                    {university.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Users */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Users ({users.length})
                                </h2>
                                {users.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No users assigned yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                                <Badge variant="outline">{user.role}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Journals */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Journals ({journals.length})
                                </h2>
                                {journals.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No journals registered yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {journals.map((journal) => (
                                            <div
                                                key={journal.id}
                                                className="p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="font-medium text-gray-900">{journal.title}</div>
                                                {journal.issn && (
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        ISSN: {journal.issn}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Statistics */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-green-600" />
                                            <span className="text-gray-600">Total Users</span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {university.users_count}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-green-600" />
                                            <span className="text-gray-600">Total Journals</span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {university.journals_count}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="text-gray-500 mb-1">Created At</div>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Calendar className="w-4 h-4" />
                                            {university.created_at}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Last Updated</div>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Calendar className="w-4 h-4" />
                                            {university.updated_at}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
