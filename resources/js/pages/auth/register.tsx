import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    position: string;
};

export default function Register() {
    const { data, setData, post, processing, errors } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        position: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <Head title="Register" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50 p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link href="/">
                            <h1 className="text-3xl font-bold text-green-600">Asistensi Jurnal Muhammadiyah</h1>
                            <p className="mt-2 text-gray-600">Platform Manajemen Jurnal Ilmiah PTM</p>
                        </Link>
                    </div>

                    {/* Register Form */}
                    <div className="rounded-2xl bg-white p-8 shadow-xl">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900">Daftar Akun</h2>
                            <p className="mt-2 text-gray-600">Buat akun baru untuk memulai</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <Label htmlFor="name">Nama Lengkap *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoFocus
                                    className="mt-2"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <Label htmlFor="email">Email *</Label>
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
                                <Label htmlFor="phone">No. Telepon</Label>
                                <Input id="phone" type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-2" />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>

                            {/* Position */}
                            <div>
                                <Label htmlFor="position">Jabatan</Label>
                                <Input
                                    id="position"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    className="mt-2"
                                    placeholder="Dosen, Staf, dll"
                                />
                                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="mt-2"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <Label htmlFor="password_confirmation">Konfirmasi Password *</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    className="mt-2"
                                />
                                {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" disabled={processing} className="mt-6 w-full">
                                {processing ? 'Mendaftar...' : 'Daftar'}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Sudah punya akun?{' '}
                            <Link href={route('login')} className="font-medium text-green-600 hover:text-green-700">
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
