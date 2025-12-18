/**
 * UsersEdit Component for Admin Kampus
 * 
 * @description
 * A form page for editing existing user (Pengelola Jurnal) accounts within the admin's university.
 * Password fields are optional - leave empty to keep the existing password.
 * 
 * @features
 * - Pre-filled personal information fields
 * - Optional password update
 * - Status toggle
 * - Form validation with error display
 * - University displayed as read-only info
 * 
 * @route GET /admin-kampus/users/{id}/edit
 * @route PUT /admin-kampus/users/{id}
 */
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    position: string | null;
    is_active: boolean;
}

interface University {
    id: number;
    name: string;
    short_name: string;
}

interface Props {
    user: User;
    university: University;
}

export default function UsersEdit({ user, university }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'User Management',
            href: '/admin-kampus/users',
        },
        {
            title: user.name,
            href: `/admin-kampus/users/${user.id}`,
        },
        {
            title: 'Edit',
            href: `/admin-kampus/users/${user.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        phone: user.phone || '',
        position: user.position || '',
        is_active: user.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin-kampus.users.update', user.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin-kampus.users.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">
                            Edit User
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Update user information for {user.name}
                        </p>
                    </div>

                    {/* University Info */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-blue-800 dark:text-blue-200">
                                University: {university.name} ({university.short_name})
                            </span>
                        </div>
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
                                    placeholder="e.g., John Doe"
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
                                    placeholder="e.g., john.doe@example.com"
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
                                    placeholder="e.g., 081234567890"
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
                                    placeholder="e.g., Editor, Managing Editor"
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
                                Change Password
                            </h3>

                            {/* Password Update Notice */}
                            <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Leave password fields empty to keep the current password unchanged.
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
                                {errors.password && (
                                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1">
                                    Minimum 8 characters (leave empty to keep current password)
                                </p>
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
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active (User can login and manage journals)
                                </Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-sidebar-border/70 dark:border-sidebar-border">
                            <Link href={route('admin-kampus.users.index')}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update User'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
