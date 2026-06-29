import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicLayout from '@/layouts/public-layout';
import { PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

import EventCard, { type EventCardProps as AgendaItem } from '@/components/event-card';

interface Props {
    agendas: PaginatedData<AgendaItem>;
    filters?: { search?: string; type?: string; university_id?: string; location_type?: string; time_filter?: string };
    types?: string[];
    universities?: { id: number; name: string }[];
}

export default function Index({ agendas, filters, types = [], universities = [] }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || 'all');
    const [universityId, setUniversityId] = useState(filters?.university_id || 'all');
    const [locationType, setLocationType] = useState(filters?.location_type || 'all');
    const timeFilter = filters?.time_filter || 'upcoming';

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('events.index'),
            {
                search,
                type: type !== 'all' ? type : undefined,
                university_id: universityId !== 'all' ? universityId : undefined,
                location_type: locationType !== 'all' ? locationType : undefined,
                time_filter: timeFilter,
            },
            { preserveState: true },
        );
    };

    return (
        <PublicLayout>
            <Head title="Events & Agendas" />

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#079C4E] to-[#10816F] py-16 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#FCEE1F] opacity-10 mix-blend-overlay blur-3xl"></div>
                    <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#1A2A75] opacity-20 mix-blend-multiply blur-3xl"></div>
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                    ></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-12 text-center sm:px-6 lg:px-8">
                    <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: '"El Messiri", serif' }}>
                        {timeFilter === 'past' ? 'Past' : 'Upcoming'} <span className="text-[#FCEE1F]">Events & Agendas</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-emerald-50">
                        Discover conferences, workshops, and calls for papers from universities across the network.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="relative z-20 mx-auto -mt-8 mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
                        <div className="relative sm:col-span-2 lg:col-span-4">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search events by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 rounded-full pl-12 text-base"
                            />
                        </div>
                        <div className="w-full lg:col-span-2">
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-12 rounded-full">
                                    <SelectValue placeholder="Event Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {types.map((t) => (
                                        <SelectItem key={t} value={t} className="capitalize">
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full lg:col-span-2">
                            <Select value={universityId} onValueChange={setUniversityId}>
                                <SelectTrigger className="h-12 rounded-full">
                                    <SelectValue placeholder="University" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Universities</SelectItem>
                                    {universities.map((u) => (
                                        <SelectItem key={u.id} value={u.id.toString()}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:col-span-2 lg:col-span-2">
                            <Select value={locationType} onValueChange={setLocationType}>
                                <SelectTrigger className="h-12 rounded-full">
                                    <SelectValue placeholder="Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    <SelectItem value="Online">Online</SelectItem>
                                    <SelectItem value="Offline">Offline</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="h-12 w-full rounded-full bg-[#079C4E] px-8 font-semibold hover:bg-[#068A44] sm:col-span-2 lg:col-span-2"
                        >
                            Search
                        </Button>
                    </form>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-center border-b">
                    <button
                        onClick={() => router.get(route('events.index'), { ...filters, time_filter: 'upcoming' })}
                        className={`border-b-2 px-6 py-3 text-sm font-semibold transition-all ${timeFilter === 'upcoming' ? 'border-[#079C4E] text-[#079C4E]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Upcoming Events
                    </button>
                    <button
                        onClick={() => router.get(route('events.index'), { ...filters, time_filter: 'past' })}
                        className={`border-b-2 px-6 py-3 text-sm font-semibold transition-all ${timeFilter === 'past' ? 'border-[#079C4E] text-[#079C4E]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Past Events
                    </button>
                </div>

                {agendas.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 py-16 text-center">
                        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No events found</h3>
                        <p className="mt-2 text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                        {(search || type !== 'all' || universityId !== 'all' || locationType !== 'all') && (
                            <Button
                                variant="link"
                                onClick={() => {
                                    setSearch('');
                                    setType('all');
                                    setUniversityId('all');
                                    setLocationType('all');
                                    router.get(route('events.index'));
                                }}
                                className="mt-4"
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                        {agendas.data.map((agenda) => (
                            <EventCard key={agenda.id} agenda={agenda} />
                        ))}
                    </div>
                )}

                {agendas.last_page > 1 && (
                    <div className="mt-12 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                {agendas.links.map((link, i) => (
                                    <PaginationItem key={i}>
                                        {link.label.includes('Previous') ? (
                                            <PaginationPrevious
                                                href={link.url || '#'}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (link.url) router.get(link.url);
                                                }}
                                            />
                                        ) : link.label.includes('Next') ? (
                                            <PaginationNext
                                                href={link.url || '#'}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (link.url) router.get(link.url);
                                                }}
                                            />
                                        ) : (
                                            <PaginationLink
                                                href={link.url || '#'}
                                                isActive={link.active}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (link.url) router.get(link.url);
                                                }}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
