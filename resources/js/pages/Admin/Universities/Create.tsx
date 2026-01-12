/**
 * UniversitiesCreate Component
 * 
 * @description
 * A form page for creating new university (PTM) records in the system.
 * This component provides input fields for university details including
 * basic information, address, contact details, and initial status.
 * 
 * @component
 * 
 * @route GET /admin/universities/create
 * @route POST /admin/universities
 * 
 * @requires @inertiajs/react
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires @/components/ui/label
 * @requires @/components/ui/textarea
 * @requires @/layouts/app-layout
 * @requires lucide-react
 * 
 * @author JurnalMU Team
 * @filepath /resources/js/pages/Admin/Universities/Create.tsx
 */
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Universities',
        href: '/admin/universities',
    },
    {
        title: 'Create',
        href: '/admin/universities/create',
    },
];

export default function UniversitiesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        short_name: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        phone: '',
        email: '',
        website: '',
        logo_url: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.universities.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create University" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-950 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.universities.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">
                            Create New University
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Add a new Perguruan Tinggi Muhammadiyah
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground border-b border-sidebar-border/70 dark:border-sidebar-border pb-2">
                                Basic Information
                            </h3>

                            {/* Code */}
                            <div>
                                <Label htmlFor="code">
                                    University Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="e.g., UAD, UMY"
                                    required
                                    className="mt-2"
                                />
                                {errors.code && (
                                    <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <Label htmlFor="name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Universitas Ahmad Dahlan"
                                    required
                                    className="mt-2"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Short Name */}
                            <div>
                                <Label htmlFor="short_name">Short Name</Label>
                                <Input
                                    id="short_name"
                                    value={data.short_name}
                                    onChange={(e) => setData('short_name', e.target.value)}
                                    placeholder="e.g., UAD"
                                    className="mt-2"
                                />
                                {errors.short_name && (
                                    <p className="text-sm text-red-600 mt-1">{errors.short_name}</p>
                                )}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground border-b border-sidebar-border/70 dark:border-sidebar-border pb-2">
                                Address Information
                            </h3>

                            <div>
                                <Label htmlFor="address">Street Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={3}
                                    className="mt-2"
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="mt-2"
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="province">Province</Label>
                                    <Input
                                        id="province"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        className="mt-2"
                                    />
                                    {errors.province && (
                                        <p className="text-sm text-red-600 mt-1">{errors.province}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        className="mt-2"
                                    />
                                    {errors.postal_code && (
                                        <p className="text-sm text-red-600 mt-1">{errors.postal_code}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground border-b border-sidebar-border/70 dark:border-sidebar-border pb-2">
                                Contact Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
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

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="e.g., info@uad.ac.id"
                                        className="mt-2"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="e.g., https://uad.ac.id"
                                    className="mt-2"
                                />
                                {errors.website && (
                                    <p className="text-sm text-red-600 mt-1">{errors.website}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                                <Input
                                    id="logo_url"
                                    type="url"
                                    value={data.logo_url}
                                    onChange={(e) => setData('logo_url', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="mt-2"
                                />
                                {errors.logo_url && (
                                    <p className="text-sm text-red-600 mt-1">{errors.logo_url}</p>
                                )}
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
                                    Active (University is operational and can be assigned to users)
                                </Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-sidebar-border/70 dark:border-sidebar-border">
                            <Link href={route('admin.universities.index')}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create University'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}