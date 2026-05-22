import PublicLayout from '@/layouts/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Building2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

interface University {
    id: number;
    name: string;
    short_name: string | null;
    code: string;
    city: string | null;
    province: string | null;
    logo_url: string | null;
    accreditation_status: string | null;
    journals_count: number;
}

interface PaginatedUniversities {
    data: University[];
    current_page: number;
    last_page: number;
    links: any[];
}

interface Props {
    universities: PaginatedUniversities;
    filters: {
        search?: string;
        accreditation?: string;
        sort?: string;
    };
    accreditationOptions: string[];
}
export default function BrowseUniversities({ universities, filters, accreditationOptions }: Props) {
    const safeFilters: any = (filters && typeof filters === 'object' && !Array.isArray(filters)) ? filters : {};
    const [search, setSearch] = useState(safeFilters.search ? String(safeFilters.search) : '');
    const [debouncedSearch] = useDebounce(search, 500);
    const [accreditation, setAccreditation] = useState(safeFilters.accreditation ? String(safeFilters.accreditation) : 'all');
    const [sort, setSort] = useState(safeFilters.sort ? String(safeFilters.sort) : 'name');


    useEffect(() => {
        const query: any = {};
        if (debouncedSearch) query.search = debouncedSearch;
        if (accreditation !== 'all') query.accreditation = accreditation;
        if (sort !== 'name') query.sort = sort;

        router.get(route('browse.universities'), query, {
            preserveState: true,
            replace: true,
        });
    }, [debouncedSearch, accreditation, sort]);

    const handlePageChange = (url: string | null) => {
        if (!url) return;
        router.get(url);
    };

    return (
        <PublicLayout>
            <Head title="Browse Universities - JurnalMu" />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="text-3xl font-bold font-heading text-[#079C4E]" style={{ fontFamily: '"El Messiri", sans-serif' }}>
                        Perguruan Tinggi Muhammadiyah 'Aisyiyah
                    </h1>
                    <p className="mt-2 text-muted-foreground">Jelajahi profil dan pangkalan data jurnal ilmiah kampus PTMA se-Indonesia</p>
                </div>

                {/* Filters Bar */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="relative">
                        <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari Universitas, Nama Singkat atau Kode..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={accreditation} onValueChange={setAccreditation}>
                        <SelectTrigger>
                            <SelectValue placeholder="Semua Akreditasi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Akreditasi</SelectItem>
                            {accreditationOptions.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger>
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Nama (A-Z)</SelectItem>
                            <SelectItem value="journals_count">Jumlah Jurnal Terbanyak</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* University Cards Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {universities.data.map((uni) => (
                        <Link key={uni.id} href={route('browse.universities.show', uni.id)}>
                            <Card className="h-full border transition-all hover:border-[#079C4E]/50 hover:shadow-md cursor-pointer flex flex-col justify-between">
                                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                                    {uni.logo_url ? (
                                        <img
                                            src={uni.logo_url}
                                            alt={uni.name}
                                            className="h-12 w-12 rounded-lg object-contain border bg-white p-1"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-[#079C4E] border border-emerald-100">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base font-bold line-clamp-2 leading-tight">
                                            {uni.name}
                                        </CardTitle>
                                        <span className="font-mono text-xs text-muted-foreground">Code: {uni.code}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 flex flex-col gap-2">
                                    <div className="flex flex-wrap gap-1">
                                        {uni.accreditation_status && (
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold border-emerald-100">
                                                {uni.accreditation_status}
                                            </Badge>
                                        )}
                                        {(uni.city || uni.province) && (
                                            <Badge variant="outline" className="text-xs max-w-full truncate">
                                                {uni.city || uni.province}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" /> Jurnal
                                        </span>
                                        <span className="font-semibold text-[#079C4E]">{uni.journals_count} Jurnal</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Pagination Links */}
                {universities.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-1">
                        {universities.links.map((link, idx) => (
                            <Button
                                key={idx}
                                variant={link.active ? 'default' : 'outline'}
                                className={link.active ? 'bg-[#079C4E] text-white hover:bg-[#068442]' : ''}
                                onClick={() => handlePageChange(link.url)}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
