import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicLayout from '@/layouts/public-layout';
import { PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Clock, MapPin, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import EventCard, { type EventCardProps as AgendaItem } from '@/components/event-card';


interface Props {
    agendas: PaginatedData<AgendaItem>;
    filters?: { search?: string; type?: string };
    types?: string[];
}

export default function Index({ agendas, filters, types = [] }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || 'all');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('events.index'),
            {
                search,
                type: type !== 'all' ? type : undefined,
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
                        Upcoming <span className="text-[#FCEE1F]">Events & Agendas</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-emerald-50">
                        Discover conferences, workshops, and calls for papers from universities across the network.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="relative z-20 mx-auto -mt-8 mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search events by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 rounded-full pl-12 text-base"
                            />
                        </div>
                        <div className="w-full sm:w-[250px]">
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
                        <Button
                            type="submit"
                            size="lg"
                            className="h-12 w-full rounded-full bg-[#079C4E] px-8 font-semibold hover:bg-[#068A44] sm:w-auto"
                        >
                            Search
                        </Button>
                    </form>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                {agendas.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 py-16 text-center">
                        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No events found</h3>
                        <p className="mt-2 text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                        {(search || type !== 'all') && (
                            <Button
                                variant="link"
                                onClick={() => {
                                    setSearch('');
                                    setType('all');
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
