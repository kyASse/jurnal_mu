/**
 * AdminKampusCreate Component
 * 
 * @description
 * A comprehensive form page for creating new campus administrator (Admin Kampus) accounts.
 * This component provides a multi-section form interface for entering admin information,
 * including personal details, account credentials, university assignment, and initial status.
 * 
 * @component
 * 
 * @interface University
 * @property {number} id - Unique identifier for the university
 * @property {string} name - Full name of the university
 * @property {string} short_name - Abbreviated university name
 * @property {string} code - University code
 * 
 * @interface Props
 * @property {University[]} universities - Array of available universities for assignment
 * 
 * @param {Props} props - Component props
 * @param {University[]} props.universities - List of universities to assign admin to
 * 
 * @returns The rendered admin kampus creation form
 * 
 * @example
 * ```tsx
 * <AdminKampusCreate 
 *   universities={universitiesList}
 * />
 * ```
 * 
 * @features
 * - Personal Information Section
 *   - Full name (required)
 *   - Email address (required, must be unique)
 *   - Phone number (optional)
 *   - Position/title (optional)
 * - Account Information Section
 *   - Password (required, minimum 8 characters)
 *   - Password confirmation (required, must match)
 * - University Assignment Section
 *   - Select university from dropdown (required)
 *   - Shows university code and name
 * - Status Section
 *   - Active/inactive checkbox toggle
 *   - Default: Active
 * - Form validation with error display
 * - Loading state during submission
 * - Cancel and submit buttons
 * - Breadcrumb navigation
 * - Dark mode support
 * - Responsive layout
 * 
 * @formData
 * @property {string} name - Admin's full name
 * @property {string} email - Login email address
 * @property {string} password - Account password
 * @property {string} password_confirmation - Password confirmation
 * @property {string} phone - Contact phone number
 * @property {string} position - Job position or title
 * @property {string} university_id - Assigned university ID
 * @property {boolean} is_active - Account active status (default: true)
 * 
 * @route GET /admin/admin-kampus/create
 * @route POST /admin/admin-kampus (form submission)
 * 
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires @/components/ui/label
 * @requires @/components/ui/select
 * @requires @/layouts/app-layout
 * @requires lucide-react
 * 
 * @validation
 * - name: required
 * - email: required, valid email format, unique in users table
 * - password: required, minimum 8 characters
 * - password_confirmation: required, must match password
 * - university_id: required, must exist in universities table
 * 
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/AdminKampus/Create.tsx
 */
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Admin Kampus',
        href: '/admin/admin-kampus',
    },
    {
        title: 'Create',
        href: '/admin/admin-kampus/create',
    },
];

interface University {
    id: number;
    name: string;
    short_name: string;
    code: string;
}

interface Props {
    universities: University[];
}

export default function AdminKampusCreate({ universities }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        position: '',
        university_id: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.admin-kampus.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Admin Kampus" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.admin-kampus.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">
                            Create New Admin Kampus
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Add a new university administrator
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground border-b border-sidebar-border/70 dark:border-sidebar-border pb-2">
                                Personal Information
                            </h3>

                                {/* Name */}
                                <div>
                                    <Label htmlFor="name">
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Dr. Ahmad Fauzi, M.Kom"
                                        required
                                        className="mt-2"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <Label htmlFor="email">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="e.g., admin.uad@ajm.ac.id"
                                        required
                                        className="mt-2"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="e.g., 0274-563515"
                                        className="mt-2"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                    )}
                                </div>

                                {/* Position */}
                                <div>
                                    <Label htmlFor="position">Position / Title</Label>
                                    <Input
                                        id="position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="e.g., Kepala LPPM"
                                        className="mt-2"
                                    />
                                    {errors.position && (
                                        <p className="text-sm text-red-600 mt-1">{errors.position}</p>
                                    )}
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground border-b border-sidebar-border/70 dark:border-sidebar-border pb-2">
                                    Account Information
                                </h3>

                                {/* Password */}
                                <div>
                                    <Label htmlFor="password">
                                        Password <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        className="mt-2"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Minimum 8 characters
                                    </p>
                                </div>

                                {/* Password Confirmation */}
                                <div>
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {/* University Assignment */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground border-b border-sidebar-border/70 dark:border-sidebar-border pb-2">
                                    University Assignment
                                </h3>

                                {/* University */}
                                <div>
                                    <Label htmlFor="university_id">
                                        University <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.university_id.toString()}
                                        onValueChange={(value) => setData('university_id', value)}
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Select University" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {universities.map((uni) => (
                                                <SelectItem key={uni.id} value={uni.id.toString()}>
                                                    {uni.code} - {uni.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.university_id && (
                                        <p className="text-sm text-red-600 mt-1">{errors.university_id}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This admin will manage journals and users for this university
                                    </p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground border-b border-sidebar-border/70 dark:border-sidebar-border pb-2">
                                    Status
                                </h3>

                                <div className="flex items-center space-x-2">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Active (Admin can login and manage their university)
                                    </Label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-sidebar-border/70 dark:border-sidebar-border">
                                <Link href={route('admin.admin-kampus.index')}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Admin Kampus'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </AppLayout>
        );
    }