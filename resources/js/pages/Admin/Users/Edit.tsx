/**
 * UsersEdit Component for Super Admin
 *
 * @description
 * A comprehensive form page for editing existing user (Pengelola Jurnal) accounts.
 * This component provides a multi-section form interface for updating user information,
 * including personal details, password changes (optional), university assignment, reviewer status, and account status.
 * Password fields are optional - leave empty to keep the existing password.
 *
 * @component
 *
 * @interface User
 * @property {number} id - Unique identifier for the user
 * @property {string} name - Full name of the user
 * @property {string} email - Email address for login
 * @property {string|null} phone - Contact phone number
 * @property {number} university_id - ID of the assigned university
 * @property {boolean} is_active - Account activation status
 * @property {boolean} is_reviewer - Reviewer status (v1.1 feature)
 *
 * @interface University
 * @property {number} id - Unique identifier for the university
 * @property {string} name - Full name of the university
 * @property {string} short_name - Abbreviated university name
 * @property {string} code - University code
 *
 * @interface Props
 * @property {User} user - The user data to be edited
 * @property {University[]} universities - Array of available universities for assignment
 *
 * @param {Props} props - Component props
 * @param {User} props.user - User data to edit
 * @param {University[]} props.universities - List of universities for assignment
 *
 * @returns The rendered user edit form
 *
 * @example
 * ```tsx
 * <UsersEdit
 *   user={{
 *     id: 1,
 *     name: "John Doe",
 *     email: "john@university.edu",
 *     phone: "081234567890",
 *     university_id: 1,
 *     is_active: true,
 *     is_reviewer: false
 *   }}
 *   universities={[
 *     { id: 1, name: "University of Example", short_name: "UE", code: "UE001" }
 *   ]}
 * />
 * ```
 *
 * @features
 * - Personal Information Section
 *   - Full name (required)
 *   - Email address (required, unique except current)
 *   - Phone number (optional)
 * - Account Information Section
 *   - Password (optional - leave empty to keep current)
 *   - Password confirmation (required if password filled)
 *   - Warning message about optional password update
 * - University Assignment Section
 *   - Select university from dropdown (required)
 *   - Pre-selected with current university
 * - Reviewer Status Section (v1.1 Feature)
 *   - Checkbox to mark user as reviewer
 * - Status Section
 *   - Active/inactive checkbox toggle
 * - Form validation with error display
 * - Loading state during submission
 * - Cancel and update buttons
 * - Dynamic breadcrumb with user name
 * - Back to list button
 * - Dark mode support
 * - Responsive layout
 *
 * @formData
 * @property {string} name - User's full name
 * @property {string} email - Login email address
 * @property {string} password - New password (optional)
 * @property {string} password_confirmation - Password confirmation (if password set)
 * @property {string} phone - Contact phone number
 * @property {string} university_id - Assigned university ID
 * @property {boolean} is_reviewer - Reviewer status
 * @property {boolean} is_active - Account active status
 *
 * @route GET /admin/users/{id}/edit
 * @route PUT /admin/users/{id} (form submission)
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
 * - email: required, valid email format, unique except current user
 * - password: optional, if provided minimum 8 characters
 * - password_confirmation: required if password provided, must match
 * - university_id: required, must exist in universities table
 *
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/Users/Edit.tsx
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    university_id: number;
    is_active: boolean;
    is_reviewer: boolean;
}

interface University {
    id: number;
    name: string;
    short_name: string;
    code: string;
}

interface Props {
    user: User;
    universities: University[];
}

export default function UsersEdit({ user, universities }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'User Management',
            href: '#',
        },
        {
            title: 'Pengelola Jurnal',
            href: '/admin/users',
        },
        {
            title: user.name,
            href: `/admin/users/${user.id}`,
        },
        {
            title: 'Edit',
            href: `/admin/users/${user.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        phone: user.phone || '',
        university_id: user.university_id.toString() || '',
        is_reviewer: user.is_reviewer || false,
        is_active: user.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.users.update', user.id), {
            onSuccess: () => {
                toast.success('Pengelola Jurnal updated successfully');
            },
            onError: () => {
                toast.error('Failed to update Pengelola Jurnal. Please check the form.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.users.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Edit Pengelola Jurnal</h1>
                                <p className="mt-1 text-muted-foreground">Update information for {user.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Personal Information
                            </h3>

                            {/* Name */}
                            <div>
                                <Label htmlFor="name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required className="mt-2" />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                                    required
                                    className="mt-2"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-2" />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Account Information
                            </h3>

                            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Leave password fields empty if you don't want to change the password
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-2"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* University Assignment */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                University Assignment
                            </h3>

                            {/* University */}
                            <div>
                                <Label htmlFor="university_id">
                                    University <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.university_id} onValueChange={(value) => setData('university_id', value)}>
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
                                {errors.university_id && <p className="mt-1 text-sm text-red-600">{errors.university_id}</p>}
                            </div>
                        </div>

                        {/* Reviewer Status (v1.1 Feature) */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Reviewer Status
                            </h3>

                            <div className="flex items-center space-x-2">
                                <input
                                    id="is_reviewer"
                                    type="checkbox"
                                    checked={data.is_reviewer}
                                    onChange={(e) => setData('is_reviewer', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="is_reviewer" className="cursor-pointer">
                                    Mark as Reviewer (can review journal assessments)
                                </Label>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-4">
                            <h3 className="border-b border-sidebar-border/70 pb-2 text-lg font-semibold text-foreground dark:border-sidebar-border">
                                Status
                            </h3>

                            <div className="flex items-center space-x-2">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active (User can login and manage their journals)
                                </Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 border-t border-sidebar-border/70 pt-6 dark:border-sidebar-border">
                            <Link href={route('admin.users.index')}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                {processing ? 'Updating...' : 'Update Pengelola Jurnal'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
