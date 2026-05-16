import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps, type University } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Profil Universitas', href: '/admin-kampus/university/edit' },
];

export default function Edit({ university }: PageProps<{ university: University }>) {
    const { data, setData, put, processing, errors } = useForm({
        profile_description: university.profile_description || '',
        website: university.website || '',
        email: university.email || '',
        phone: university.phone || '',
        address: university.address || '',
    });

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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Informasi Dasar
                            </CardTitle>
                            <CardDescription>
                                Data dasar universitas. Untuk mengubah singkatan, kode, atau nama universitas, silakan hubungi pihak Dikti.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Kode PT</Label>
                                    <Input type="text" className="mt-1 bg-neutral-100 dark:bg-neutral-800" value={university.code || ''} disabled />
                                </div>

                                <div>
                                    <Label>Singkatan</Label>
                                    <Input type="text" className="mt-1 bg-neutral-100 dark:bg-neutral-800" value={university.short_name || ''} disabled />
                                </div>

                                <div className="md:col-span-2">
                                    <Label>Nama Universitas</Label>
                                    <Input type="text" className="mt-1 bg-neutral-100 dark:bg-neutral-800" value={university.name || ''} disabled />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Informasi Kontak & Detail
                            </CardTitle>
                            <CardDescription>
                                Perbarui informasi detail universitas Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <Label htmlFor="profile_description">Deskripsi Singkat</Label>
                                    <textarea
                                        id="profile_description"
                                        className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                                            className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                            rows={3}
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <Button disabled={processing} className="gap-2">
                                        <Save className="h-4 w-4" />
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
