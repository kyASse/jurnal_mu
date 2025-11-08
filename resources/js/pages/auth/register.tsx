import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/">
                            <h1 className="text-3xl font-bold text-green-600">
                                Asistensi Jurnal Muhammadiyah
                            </h1>
                            <p className="text-gray-600 mt-2">Platform Manajemen Jurnal Ilmiah PTM</p>
                        </Link>
                    </div>

                    {/* Register Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Daftar Akun</h2>
                            <p className="text-gray-600 mt-2">Buat akun baru untuk memulai</p>
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
                                {errors.name && (
                                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                )}
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
                                {errors.email && (
                                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <Label htmlFor="phone">No. Telepon</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-2"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                )}
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
                                {errors.position && (
                                    <p className="text-sm text-red-600 mt-1">{errors.position}</p>
                                )}
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
                                {errors.password && (
                                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                )}
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
                                {errors.password_confirmation && (
                                    <p className="text-sm text-red-600 mt-1">{errors.password_confirmation}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="w-full mt-6"
                            >
                                {processing ? 'Mendaftar...' : 'Daftar'}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <p className="text-center text-sm text-gray-600 mt-6">
                            Sudah punya akun?{' '}
                            <Link 
                                href={route('login')} 
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
