import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookType, ArrowRight, ClipboardCheck, Award, Building2, ShieldCheck, Globe } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Data Master Index Page (Super Admin)
 *
 * @description Master data management page for scientific fields and reference data
 * @route GET /admin/data-master
 * @features Dashboard menu for master data
 */
export default function DataMasterIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Master', href: route('admin.data-master.index') },
    ];

    const masterDataItems = [
        {
            title: 'Scientific Fields (Bidang Ilmu)',
            description: 'Kelola kategori dan klasifikasi rumpun ilmu lengkap dengan fitur import maupun export data.',
            icon: BookType,
            href: route('admin.data-master.scientific-fields.index'),
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            isImplemented: true
        },
        {
            title: 'Indikator Penilaian',
            description: 'Konfigurasi butir indikator penilaian dan bobot skor untuk instrumen asesmen jurnal.',
            icon: ClipboardCheck,
            href: '#',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            isImplemented: false
        },
        {
            title: 'Standar Akreditasi (SINTA)',
            description: 'Atur ambang batas nilai akreditasi dan parameter penilaian standar nasional.',
            icon: Award,
            href: '#',
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            isImplemented: false
        },
        {
            title: 'Tipe Institusi (PTM)',
            description: 'Manajemen kategori institusi (Universitas, Institut, Sekolah Tinggi) di lingkungan PTM.',
            icon: Building2,
            href: '#',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
            isImplemented: false
        },
        {
            title: 'Indexing Databases',
            description: 'Daftar database pengindeks resmi (Scopus, WoS, DOAJ, Garuda) untuk validasi profil.',
            icon: Globe,
            href: '#',
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-500/10',
            isImplemented: false
        },
        {
            title: 'Global Settings',
            description: 'Pengaturan metadata sistem, periode asesmen, dan konfigurasi global lainnya.',
            icon: ShieldCheck,
            href: '#',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            isImplemented: false
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Master" />

            <div className="flex h-full flex-1 flex-col space-y-8 p-4 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Data Master</h2>
                        <p className="text-muted-foreground">Pusat pengelolaan data master dan referensi sistem.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {masterDataItems.map((item, index) => {
                        const Content = (
                            <Card className={`h-full transition-all ${item.isImplemented ? 'hover:border-primary/50 hover:bg-muted/50' : 'opacity-70 grayscale-[0.5]'}`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.bgColor}`}>
                                            <item.icon className={`h-6 w-6 ${item.color}`} />
                                        </div>
                                        {item.isImplemented ? (
                                            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                        ) : (
                                            <Badge variant="secondary" className="text-[10px] font-normal">Under Development</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="mt-4 flex items-center gap-2">
                                        {item.title}
                                    </CardTitle>
                                    <CardDescription className="mt-2 line-clamp-2">{item.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        );

                        return item.isImplemented ? (
                            <Link key={index} href={item.href} className="group outline-none focus:ring-2 focus:ring-primary">
                                {Content}
                            </Link>
                        ) : (
                            <div key={index} className="cursor-not-allowed">
                                {Content}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
