import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps, type ScientificField } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversityCombobox, type University } from '@/components/ui/university-combobox';
import { UserCombobox, type User } from '@/components/ui/user-combobox';
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
}

export default function Create({ universities, users, scientificFields }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        university_id: '',
        user_id: '',
        scientific_field_id: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.journals.store'));
    };

    // Filter users based on selected university
    const filteredUsers = data.university_id
        ? users.filter((u) => u.university_id?.toString() === data.university_id)
        : users;

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
                            <CardDescription>
                                Masukkan informasi wajib untuk membuat jurnal baru.
                            </CardDescription>
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
                                            <Select
                                                value={data.scientific_field_id}
                                                onValueChange={(val) => setData('scientific_field_id', val)}
                                            >
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
