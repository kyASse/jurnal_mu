import PublicLayout from '@/layouts/public-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { Award, BookOpen, Building2, FileText, Globe, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

interface Props {
    university: {
        id: number;
        name: string;
        short_name: string | null;
        code: string;
        address: string | null;
        city: string | null;
        province: string | null;
        website: string | null;
        email: string | null;
        phone: string | null;
        logo_url: string | null;
        accreditation_status: string | null;
        cluster: string | null;
        profile_description: string | null;
    };
    stats: {
        total_journals: number;
        total_articles: number;
        scopus_count: number;
        sinta_breakdown: Record<string, number>;
    };
    journals: any[];
    articles: any;
    years: number[];
    filters: any;
}

export default function UniversityProfile({ university, stats, journals, articles, years, filters }: Props) {
    return (
        <PublicLayout>
            <Head title={`${university.name} - JurnalMu`} />

            {/* Header Hero Section */}
            <div className="bg-gradient-to-r from-[#079C4E] to-[#056f37] py-12 text-white">
                <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center gap-6">
                    {university.logo_url ? (
                        <img
                            src={university.logo_url}
                            alt={university.name}
                            className="h-24 w-24 rounded-2xl object-contain bg-white p-2 border-2 border-white/20 shadow-lg"
                        />
                    ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 text-white border-2 border-white/20 shadow-lg">
                            <Building2 className="h-12 w-12" />
                        </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h1 className="text-3xl font-bold font-heading" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                                {university.name}
                            </h1>
                            {university.accreditation_status && (
                                <Badge className="bg-[#FCEE1F] text-black font-extrabold self-center md:self-start border-none">
                                    {university.accreditation_status}
                                </Badge>
                            )}
                        </div>
                        <p className="mt-2 text-white/90">Kode PT: {university.code} {university.short_name && `• ${university.short_name}`}</p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-white/80">
                            {(university.address || university.city) && (
                                <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-[#FCEE1F]" /> {university.address || university.city}</span>
                            )}
                            {university.website && (
                                <a href={university.website.startsWith('http') ? university.website : `https://${university.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white underline">
                                    <Globe className="h-4 w-4 text-[#FCEE1F]" /> {university.website}
                                </a>
                            )}
                            {university.email && (
                                <span className="flex items-center gap-1"><Mail className="h-4 w-4 text-[#FCEE1F]" /> {university.email}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Jurnal</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.total_journals}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Artikel</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.total_articles.toLocaleString('id-ID')}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Jurnal Terindeks Scopus</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.scopus_count}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="rounded-lg bg-emerald-50 p-3 text-[#079C4E]">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cluster PT</p>
                                <h3 className="text-2xl font-bold text-gray-900">{university.cluster || '-'}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sinta Chart and Registered Journals Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Sinta Breakdown Chart */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Klasifikasi SINTA Jurnal</CardTitle>
                            <CardDescription>Distribusi akreditasi jurnal ilmiah terdaftar</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <ReactApexChart
                                options={{
                                    chart: { type: 'donut', fontFamily: 'inherit' },
                                    labels: ['Sinta 1', 'Sinta 2', 'Sinta 3', 'Sinta 4', 'Sinta 5', 'Sinta 6', 'Tidak Terakreditasi'],
                                    colors: ['#079C4E', '#10b981', '#3b82f6', '#60a5fa', '#f59e0b', '#fca5a5', '#9ca3af'],
                                    legend: { position: 'bottom' },
                                    dataLabels: { enabled: false }
                                }}
                                series={[
                                    stats.sinta_breakdown.S1 || 0,
                                    stats.sinta_breakdown.S2 || 0,
                                    stats.sinta_breakdown.S3 || 0,
                                    stats.sinta_breakdown.S4 || 0,
                                    stats.sinta_breakdown.S5 || 0,
                                    stats.sinta_breakdown.S6 || 0,
                                    stats.sinta_breakdown.TT || 0
                                ]}
                                type="donut"
                                height={250}
                            />
                        </CardContent>
                    </Card>

                    {/* Registered Jurnal List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Jurnal Terdaftar ({journals.length})</CardTitle>
                            <CardDescription>Jurnal ilmiah Perguruan Tinggi yang sudah terverifikasi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {journals.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">Belum ada jurnal terdaftar</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                                    {journals.map((journal) => (
                                        <Link key={journal.id} href={route('journals.show', journal.id)}>
                                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-[#079C4E] hover:bg-emerald-50/20 transition-all cursor-pointer">
                                                <div className="h-10 w-8 bg-gray-100 border flex items-center justify-center rounded text-[8px] font-bold text-gray-400 overflow-hidden">
                                                    {journal.cover_image_url ? (
                                                        <img src={journal.cover_image_url} alt={journal.title} className="h-full w-full object-cover" />
                                                    ) : 'COVER'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{journal.title}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{journal.scientific_field || 'Bidang Umum'}</p>
                                                </div>
                                                {journal.sinta_rank_label && (
                                                    <Badge className="bg-[#079C4E] text-white text-xs">{journal.sinta_rank_label}</Badge>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}
