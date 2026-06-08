import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversityCombobox, type University } from '@/components/ui/university-combobox';
import { UserCombobox, type User } from '@/components/ui/user-combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps, type ScientificField } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, Save, Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Jurnal', href: '/admin/journals' },
    { title: 'Tambah Jurnal', href: '/admin/journals/create' },
];

interface Props extends PageProps {
    universities: University[];
    users: User[];
    scientificFields: ScientificField[];
    sintaRanks: Array<{ value: string; label: string }>;
}

export default function Create({ universities, users, scientificFields, sintaRanks }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        university_id: '',
        user_id: '',
        scientific_field_id: '',
        e_issn: '',
        url: '',
        editorial_team_url: '',
        sinta_rank: '',
        frequency: '',
        oai_urls: [''],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.journals.store'));
    };

    // Filter users based on selected university
    const filteredUsers = data.university_id ? users.filter((u) => u.university_id?.toString() === data.university_id) : users;

    const handleUniversityChange = (val: string) => {
        // If university changes, clear selected user if it doesn't belong to the new university
        const currentUser = users.find((u) => u.id.toString() === data.user_id);
        const newUserId = currentUser?.university_id?.toString() === val ? data.user_id : '';

        setData((prev) => ({
            ...prev,
            university_id: val,
            user_id: newUserId,
        }));
    };

    const handleUserChange = (val: string) => {
        const selectedUser = users.find((u) => u.id.toString() === val);
        if (selectedUser?.university_id) {
            setData((prev) => ({
                ...prev,
                user_id: val,
                university_id: selectedUser.university_id!.toString(),
            }));
        } else {
            setData('user_id', val);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Jurnal" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tambah Jurnal Baru</h1>
                        <p className="text-sm text-muted-foreground">Buat kerangka jurnal awal. Lengkapi data lainnya melalui menu Edit nanti.</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Informasi Dasar Jurnal
                            </CardTitle>
                            <CardDescription>Masukkan informasi wajib untuk membuat jurnal baru.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <Label htmlFor="title">Judul Jurnal</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        className="mt-1"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="university_id">Universitas</Label>
                                        <div className="mt-1">
                                            <UniversityCombobox
                                                universities={universities}
                                                value={data.university_id}
                                                onValueChange={handleUniversityChange}
                                                placeholder="Pilih Universitas..."
                                                error={errors.university_id}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="user_id">User Pengelola</Label>
                                        <div className="mt-1">
                                            <UserCombobox
                                                users={filteredUsers}
                                                value={data.user_id}
                                                onValueChange={handleUserChange}
                                                placeholder="Pilih User Pengelola..."
                                                error={errors.user_id}
                                            />
                                        </div>
                                        {data.university_id && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Menampilkan user dari universitas terpilih ({filteredUsers.length} user)
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="scientific_field_id">Bidang Keilmuan</Label>
                                        <div className="mt-1">
                                            <Select value={data.scientific_field_id} onValueChange={(val) => setData('scientific_field_id', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Bidang Keilmuan..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {scientificFields.map((field) => (
                                                        <SelectItem key={field.id} value={field.id.toString()}>
                                                            {field.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.scientific_field_id} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="e_issn">
                                                E-ISSN (Online) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="e_issn"
                                                type="text"
                                                className="mt-1"
                                                value={data.e_issn}
                                                onChange={(e) => setData('e_issn', e.target.value)}
                                                required
                                                placeholder="xxxx-xxxx"
                                            />
                                            <InputError message={errors.e_issn} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor="url">
                                                Journal URL <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="url"
                                                type="url"
                                                className="mt-1"
                                                value={data.url}
                                                onChange={(e) => setData('url', e.target.value)}
                                                required
                                                placeholder="https://journal.ac.id/..."
                                            />
                                            <InputError message={errors.url} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor="editorial_team_url">Editorial Team URL</Label>
                                            <Input
                                                id="editorial_team_url"
                                                type="url"
                                                className="mt-1"
                                                value={data.editorial_team_url}
                                                onChange={(e) => setData('editorial_team_url', e.target.value)}
                                                placeholder="https://journal.ac.id/..."
                                            />
                                            <InputError message={errors.editorial_team_url} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor="sinta_rank">
                                                Peringkat Akreditasi <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={data.sinta_rank} onValueChange={(val) => setData('sinta_rank', val)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Pilih Peringkat..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sintaRanks.map((rank) => (
                                                        <SelectItem key={rank.value} value={rank.value}>
                                                            {rank.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.sinta_rank} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor="frequency">
                                                Frekuensi Publikasi <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={data.frequency} onValueChange={(val) => setData('frequency', val)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Pilih Frekuensi..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Monthly">Monthly (Bulanan)</SelectItem>
                                                    <SelectItem value="Bi-Monthly">Bi-Monthly (2 Bulanan)</SelectItem>
                                                    <SelectItem value="Quarterly">Quarterly (Triwulan)</SelectItem>
                                                    <SelectItem value="4-Monthly">4 Bulanan (3 Kali Terbit Per Tahun)</SelectItem>
                                                    <SelectItem value="Semi-Annual">Semi-Annual (Semesteran)</SelectItem>
                                                    <SelectItem value="Annual">Annual (Tahunan)</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.frequency} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between">
                                            <Label>
                                                OAI-PMH URLs <span className="text-red-500">*</span>
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setData('oai_urls', [...data.oai_urls, ''])}
                                            >
                                                Tambah URL OAI
                                            </Button>
                                        </div>
                                        <div className="mt-2 space-y-2">
                                            {data.oai_urls.map((oaiUrl, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        type="url"
                                                        value={oaiUrl}
                                                        onChange={(e) => {
                                                            const newUrls = [...data.oai_urls];
                                                            newUrls[index] = e.target.value;
                                                            setData('oai_urls', newUrls);
                                                        }}
                                                        placeholder="https://journal.ac.id/oai"
                                                        required
                                                    />
                                                    {data.oai_urls.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => {
                                                                const newUrls = data.oai_urls.filter((_, i) => i !== index);
                                                                setData('oai_urls', newUrls);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <InputError message={errors.oai_urls} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4">
                                    <Link
                                        href={route('admin.journals.index')}
                                        className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        Batal
                                    </Link>
                                    <Button disabled={processing} className="gap-2">
                                        <Save className="h-4 w-4" />
                                        Simpan Jurnal
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
