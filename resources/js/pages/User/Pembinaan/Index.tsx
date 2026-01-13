import { UnderConstruction } from '@/components/under-construction';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Award } from 'lucide-react';

/**
 * Pembinaan Index Page (User/Pengelola Jurnal)
 *
 * @description Journal coaching, accreditation and indexing guidance
 * @route GET /user/pembinaan
 * @features Akreditasi and Indeksasi guidance - Currently under development
 */
export default function PembinaanIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pembinaan', href: route('user.pembinaan.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembinaan" />

            <UnderConstruction
                title="Pembinaan"
                description="Panduan dan sumber daya untuk akreditasi dan indeksasi jurnal."
                icon={Award}
                features={[
                    'Panduan Akreditasi jurnal',
                    'Tips Indeksasi internasional',
                    'Checklist kelengkapan dokumen',
                    'Jadwal dan timeline proses',
                ]}
            />
        </AppLayout>
    );
}
