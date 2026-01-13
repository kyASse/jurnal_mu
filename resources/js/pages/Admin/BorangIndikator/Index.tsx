import { UnderConstruction } from '@/components/under-construction';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';

/**
 * Borang Indikator Index Page (Super Admin)
 *
 * @description Evaluation form management for assessment indicators
 * @route GET /admin/borang-indikator
 * @features Manage Unsur, Sub Unsur, and Indikator - Currently under development
 */
export default function BorangIndikatorIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Borang Indikator', href: route('admin.borang-indikator.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Borang Indikator" />

            <UnderConstruction
                title="Borang Indikator"
                description="Kelola borang evaluasi untuk penilaian jurnal ilmiah."
                icon={ClipboardList}
                features={['Manajemen Unsur evaluasi', 'Manajemen Sub Unsur', 'Manajemen Indikator penilaian', 'Template borang akreditasi']}
            />
        </AppLayout>
    );
}
