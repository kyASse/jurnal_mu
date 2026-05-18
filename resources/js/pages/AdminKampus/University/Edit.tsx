import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps, type University } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Clock, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Profil Universitas', href: '/admin-kampus/university/edit' },
];

export default function Edit({ university }: PageProps<{ university: University }>) {
    const { data, setData, put, processing, errors } = useForm({
        name: university.name || '',
        code: university.code || '',
        ptm_code: university.ptm_code || '',
        profile_description: university.profile_description || '',
        website: university.website || '',
        email: university.email || '',
        phone: university.phone || '',
        address: university.address || '',
    });

    const pendingUpdates = university.pending_updates || {};
    const hasPendingUpdates = Object.keys(pendingUpdates).length > 0;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin-kampus.university.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Universitas" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Profil Universitas</h1>
                        <p className="text-sm text-muted-foreground">Kelola informasi universitas Anda yang akan ditampilkan di portal.</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {hasPendingUpdates && (
                        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                            <Clock className="h-4 w-4 stroke-amber-600 dark:stroke-amber-400" />
                            <AlertTitle>Menunggu Persetujuan</AlertTitle>
                            <AlertDescription>
                                Perubahan data dasar universitas Anda (Nama, Singkatan, atau Kode) sedang menunggu persetujuan dari pihak Dikti.
                                <ul className="mt-2 list-disc pl-5">
                                    {pendingUpdates.name && (
                                        <li>
                                            Nama: <span className="font-semibold">{pendingUpdates.name}</span>
                                        </li>
                                    )}
                                    {pendingUpdates.code && (
                                        <li>
                                            Singkatan: <span className="font-semibold">{pendingUpdates.code}</span>
                                        </li>
                                    )}
                                    {pendingUpdates.ptm_code && (
                                        <li>
                                            Kode PTM: <span className="font-semibold">{pendingUpdates.ptm_code}</span>
                                        </li>
                                    )}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Informasi Dasar
                            </CardTitle>
                            <CardDescription>
                                Data dasar universitas. Mengubah bidang ini akan memerlukan persetujuan dari pihak Dikti sebelum diterapkan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="university-form" onSubmit={submit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="ptm_code" className="flex items-center gap-2">
                                            Kode PTM
                                            {pendingUpdates.ptm_code && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/30"
                                                >
                                                    Pending
                                                </Badge>
                                            )}
                                        </Label>
                                        <Input
                                            id="ptm_code"
                                            type="text"
                                            className="mt-1"
                                            value={data.ptm_code}
                                            onChange={(e) => setData('ptm_code', e.target.value)}
                                        />
                                        <InputError message={errors.ptm_code} className="mt-2" />
                                    </div>

                                    <div>
                                        <Label htmlFor="code" className="flex items-center gap-2">
                                            Singkatan
                                            {pendingUpdates.code && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/30"
                                                >
                                                    Pending
                                                </Badge>
                                            )}
                                        </Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            className="mt-1"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                        />
                                        <InputError message={errors.code} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="name" className="flex items-center gap-2">
                                            Nama Universitas
                                            {pendingUpdates.name && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/30"
                                                >
                                                    Pending
                                                </Badge>
                                            )}
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            className="mt-1"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Informasi Kontak & Detail
                            </CardTitle>
                            <CardDescription>Perbarui informasi detail universitas Anda.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="profile_description">Deskripsi Singkat</Label>
                                    <textarea
                                        id="profile_description"
                                        className="mt-1 block w-full rounded-md border-border bg-background p-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                        rows={4}
                                        value={data.profile_description}
                                        onChange={(e) => setData('profile_description', e.target.value)}
                                    />
                                    <InputError message={errors.profile_description} className="mt-2" />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="email">Email Kontak</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Nomor Telepon</Label>
                                        <Input
                                            id="phone"
                                            type="text"
                                            className="mt-1"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            type="url"
                                            className="mt-1"
                                            value={data.website}
                                            onChange={(e) => setData('website', e.target.value)}
                                            placeholder="https://..."
                                        />
                                        <InputError message={errors.website} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="address">Alamat Lengkap</Label>
                                        <textarea
                                            id="address"
                                            className="mt-1 block w-full rounded-md border-border bg-background p-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                            rows={3}
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <Button disabled={processing} form="university-form" onClick={submit} className="gap-2">
                                        <Save className="h-4 w-4" />
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
