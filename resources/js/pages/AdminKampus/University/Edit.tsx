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
import { Building2, Clock, Image as ImageIcon, Save, UploadCloud, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Profil Universitas', href: '/admin-kampus/university/edit' },
];

export default function Edit({ university }: PageProps<{ university: University }>) {
    const pendingUpdates = university.pending_updates || {};
    const hasPendingUpdates = Object.keys(pendingUpdates).length > 0;

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: pendingUpdates.name !== undefined ? pendingUpdates.name : university.name || '',
        short_name: university.short_name || '',
        code: pendingUpdates.code !== undefined ? pendingUpdates.code : university.code || '',
        ptm_code: pendingUpdates.ptm_code !== undefined ? pendingUpdates.ptm_code : university.ptm_code || '',
        profile_description: university.profile_description || '',
        website: university.website || '',
        email: university.email || '',
        phone: university.phone || '',
        address: university.address || '',
        city: university.city || '',
        province: university.province || '',
        postal_code: university.postal_code || '',
        logo_url: university.logo_url || '',
        logo_file: null as File | null,
        accreditation_status: university.accreditation_status || '',
        cluster: university.cluster || '',
    });

    const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
    const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    useEffect(() => {
        setIsLoadingProvinces(true);
        fetch(route('admin-kampus.locations.provinces'))
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setProvinces(data);
                } else {
                    toast.error('Gagal memuat data provinsi');
                }
            })
            .catch((err) => {
                console.error('Failed to fetch provinces', err);
                toast.error('Gagal memuat data provinsi');
            })
            .finally(() => {
                setIsLoadingProvinces(false);
            });
    }, []);

    useEffect(() => {
        if (!data.province || provinces.length === 0) {
            setCities([]);
            return;
        }

        const matchedProvince = provinces.find((p) => p.name.toLowerCase() === data.province.toLowerCase());

        if (matchedProvince) {
            setIsLoadingCities(true);
            fetch(route('admin-kampus.locations.cities', matchedProvince.id))
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setCities(data);
                    } else {
                        toast.error('Gagal memuat data kota');
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch cities', err);
                    setCities([]);
                    toast.error('Gagal memuat data kota');
                })
                .finally(() => {
                    setIsLoadingCities(false);
                });
        } else {
            setCities([]);
        }
    }, [provinces, data.province]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin-kampus.university.update'));
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

                                    <div className="md:col-span-2">
                                        <Label htmlFor="short_name" className="flex items-center gap-2">
                                            Nama Pendek
                                        </Label>
                                        <Input
                                            id="short_name"
                                            type="text"
                                            className="mt-1"
                                            value={data.short_name}
                                            onChange={(e) => setData('short_name', e.target.value)}
                                        />
                                        <InputError message={errors.short_name} className="mt-2" />
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

                                    <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
                                        <div>
                                            <Label htmlFor="city">Kota/Kabupaten</Label>
                                            <select
                                                id="city"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                disabled={isLoadingCities || !data.province}
                                            >
                                                <option value="">{isLoadingCities ? 'Memuat...' : 'Pilih Kota/Kabupaten'}</option>
                                                {cities.map((city) => (
                                                    <option key={city.id} value={city.name}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.city} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor="province">Provinsi</Label>
                                            <select
                                                id="province"
                                                value={data.province}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setData((prev) => ({
                                                        ...prev,
                                                        province: val,
                                                        city: '',
                                                    }));
                                                    setCities([]);
                                                }}
                                                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                disabled={isLoadingProvinces}
                                            >
                                                <option value="">{isLoadingProvinces ? 'Memuat...' : 'Pilih Provinsi'}</option>
                                                {provinces.map((prov) => (
                                                    <option key={prov.id} value={prov.name}>
                                                        {prov.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.province} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor="postal_code">Kode Pos</Label>
                                            <Input
                                                id="postal_code"
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                                className="mt-1"
                                            />
                                            <InputError message={errors.postal_code} className="mt-2" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="accreditation_status">Status Akreditasi</Label>
                                        <select
                                            id="accreditation_status"
                                            value={data.accreditation_status}
                                            onChange={(e) => setData('accreditation_status', e.target.value)}
                                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                        >
                                            <option value="">Pilih Akreditasi</option>
                                            <option value="Unggul">Unggul</option>
                                            <option value="Baik Sekali">Baik Sekali</option>
                                            <option value="Baik">Baik</option>
                                            <option value="Cukup">Cukup</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="-">-</option>
                                        </select>
                                        <InputError message={errors.accreditation_status} className="mt-2" />
                                    </div>

                                    <div>
                                        <Label htmlFor="cluster">Klaster</Label>
                                        <select
                                            id="cluster"
                                            value={data.cluster}
                                            onChange={(e) => setData('cluster', e.target.value)}
                                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                        >
                                            <option value="">Pilih Klaster</option>
                                            <option value="Mandiri">Mandiri</option>
                                            <option value="Utama">Utama</option>
                                            <option value="Madya">Madya</option>
                                            <option value="Pratama">Pratama</option>
                                        </select>
                                        <InputError message={errors.cluster} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="logo_file">Logo Universitas</Label>
                                        <div className="mt-2">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                {/* Logo Preview */}
                                                {data.logo_file || data.logo_url ? (
                                                    <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-sidebar-border bg-neutral-50 p-2 dark:bg-neutral-900">
                                                        <img
                                                            src={data.logo_file ? URL.createObjectURL(data.logo_file) : data.logo_url}
                                                            alt="Logo Preview"
                                                            className="h-full w-full object-contain"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    logo_file: null,
                                                                    logo_url: '',
                                                                }));
                                                            }}
                                                            className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-sidebar-border bg-neutral-50 text-muted-foreground dark:bg-neutral-900">
                                                        <ImageIcon className="h-8 w-8 stroke-neutral-400" />
                                                    </div>
                                                )}

                                                {/* Dropzone area */}
                                                <div
                                                    className="relative flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-4 text-center transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950/20 dark:hover:bg-neutral-950/40"
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        const file = e.dataTransfer.files?.[0];
                                                        if (file && file.type.startsWith('image/')) {
                                                            setData('logo_file', file);
                                                        } else {
                                                            toast.error('Harap unggah file gambar saja.');
                                                        }
                                                    }}
                                                    onClick={() => document.getElementById('logo-file-input')?.click()}
                                                >
                                                    <input
                                                        id="logo-file-input"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) setData('logo_file', file);
                                                        }}
                                                    />
                                                    <UploadCloud className="mb-2 h-8 w-8 text-neutral-400 dark:text-neutral-600" />
                                                    <p className="text-sm font-medium text-foreground">
                                                        Tarik & lepas file di sini, atau klik untuk memilih file
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, JPEG atau GIF (Maks. 2MB)</p>
                                                </div>
                                            </div>
                                        </div>
                                        <InputError message={errors.logo_file} className="mt-2" />
                                        <InputError message={errors.logo_url} className="mt-2" />
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
