import AppLayout from '@/layouts/app-layout';
import { UnderConstruction } from '@/components/under-construction';
import { Head } from '@inertiajs/react';
import { ClipboardCheck } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

/**
 * Assessments Monitoring Index Page (Admin Kampus)
 * 
 * @description Monitor journal assessments within university
 * @route GET /admin-kampus/assessments
 * @features View and monitor assessments in own university - Currently under development
 */
export default function AssessmentsIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessments', href: route('admin-kampus.assessments.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assessment Monitoring" />
            
            <UnderConstruction
                title="Assessment Monitoring"
                description="Monitor dan kelola penilaian jurnal di universitas Anda."
                icon={ClipboardCheck}
                features={[
                    'Lihat assessment dari pengelola jurnal',
                    'Validasi dan verifikasi assessment',
                    'Laporan progress penilaian',
                    'Export data assessment',
                ]}
            />
        </AppLayout>
    );
}
