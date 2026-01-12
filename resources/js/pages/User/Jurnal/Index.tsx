import AppLayout from '@/layouts/app-layout';
import { UnderConstruction } from '@/components/under-construction';
import { Head } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

/**
 * Jurnal Index Page (User/Pengelola Jurnal)
 * 
 * @description Manage journals for journal managers
 * @route GET /user/jurnal
 * @features Journal CRUD operations - Currently under development
 */
export default function JurnalIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Jurnal', href: route('user.jurnal.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal" />
            
            <UnderConstruction
                title="Jurnal"
                description="Kelola jurnal ilmiah yang Anda tangani."
                icon={BookOpen}
                features={[
                    'Daftar jurnal yang dikelola',
                    'Tambah jurnal baru',
                    'Update informasi jurnal',
                    'Upload dokumen jurnal',
                ]}
            />
        </AppLayout>
    );
}
