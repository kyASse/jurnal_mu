import AppLayout from '@/layouts/app-layout';
import { UnderConstruction } from '@/components/under-construction';
import { Head } from '@inertiajs/react';
import { Award } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

/**
 * Pembinaan Index Page (Admin Kampus)
 * 
 * @description Journal coaching and accreditation management
 * @route GET /admin-kampus/pembinaan
 * @features Akreditasi and Indeksasi management - Currently under development
 */
export default function PembinaanIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pembinaan', href: route('admin-kampus.pembinaan.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembinaan" />
            
            <UnderConstruction
                title="Pembinaan"
                description="Kelola proses pembinaan jurnal untuk akreditasi dan indeksasi."
                icon={Award}
                features={[
                    'Proses Akreditasi jurnal',
                    'Tracking Indeksasi',
                    'Coaching dan mentoring',
                    'Roadmap peningkatan kualitas',
                ]}
            />
        </AppLayout>
    );
}
