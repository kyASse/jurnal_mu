import { UnderConstruction } from '@/components/under-construction';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { UserCheck } from 'lucide-react';

/**
 * Profil Index Page (User/Pengelola Jurnal)
 *
 * @description User profile and account management
 * @route GET /user/profil
 * @features Profile settings and journal manager information - Currently under development
 */
export default function ProfilIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Profil', href: route('user.profil.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil" />

            <UnderConstruction
                title="Profil"
                description="Kelola profil dan informasi pengelola jurnal Anda."
                icon={UserCheck}
                features={['Update informasi profil', 'Kelola jurnal yang dikelola', 'Riwayat aktivitas', 'Pengaturan notifikasi']}
            />
        </AppLayout>
    );
}
