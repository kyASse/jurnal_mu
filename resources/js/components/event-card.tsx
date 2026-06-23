import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/utils/price';
import { Link } from '@inertiajs/react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface EventCardProps {
    id: number;
    title: string;
    slug: string;
    type: string;
    description?: string;
    thumbnail_url: string | null;
    date_start: string | null;
    time_start: string | null;
    location_type: string;
    location_venue: string | null;
    price?: string | null;
    currency?: string | null;
    quota?: number | null;
    is_featured: boolean;
    university: {
        name: string;
        logo_url: string | null;
    } | null;
}

export default function EventCard({ agenda }: { agenda: EventCardProps }) {
    const [countdown, setCountdown] = useState<string>('');

    useEffect(() => {
        if (!agenda.date_start) return;

        const updateCountdown = () => {
            const startDateTime = new Date(`${agenda.date_start}T${agenda.time_start || '00:00'}:00+07:00`);
            const now = new Date();
            const diff = startDateTime.getTime() - now.getTime();

            if (diff <= 0) {
                setCountdown('Event Started');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setCountdown(`Starts in ${days}d ${hours}h`);
        };

        updateCountdown();

        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [agenda.date_start, agenda.time_start]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return { day: 'TBA', monthAndYear: 'TBA' };
        const d = new Date(dateString);
        return {
            day: d.toLocaleDateString('id-ID', { day: 'numeric' }),
            monthAndYear: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        };
    };

    const dateFormatted = formatDate(agenda.date_start);

    return (
        <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-lg">
            <div className="relative aspect-video overflow-hidden bg-muted">
                {agenda.thumbnail_url ? (
                    <img
                        src={agenda.thumbnail_url}
                        alt={agenda.title}
                        className="h-full w-full transform object-cover transition-transform duration-500 hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5">
                        <CalendarDays className="h-16 w-16 text-primary/30" />
                    </div>
                )}
                {/* Date Highlight Badge */}
                <div className="absolute top-4 right-4 flex min-w-[60px] flex-col overflow-hidden rounded-xl border border-border/50 bg-background/95 text-center shadow-lg backdrop-blur">
                    <div className="bg-primary px-3 py-1 text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
                        {agenda.date_start ? new Date(agenda.date_start).toLocaleDateString('id-ID', { month: 'short' }) : 'TBA'}
                    </div>
                    <div className="px-3 py-1.5 text-xl font-black text-foreground">{dateFormatted.day}</div>
                </div>

                {agenda.is_featured && (
                    <div className="absolute top-4 left-4">
                        <Badge variant="default" className="border-none bg-yellow-400 font-bold text-yellow-950 shadow-md hover:bg-yellow-500">
                            Featured
                        </Badge>
                    </div>
                )}
                {/* Countdown Overlay */}
                {countdown && (
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <Clock className="h-4 w-4 text-emerald-400" />
                            <span>{countdown}</span>
                        </div>
                    </div>
                )}
            </div>

            <CardHeader className="flex-none pt-5 pb-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                    {agenda.university && (
                        <div className="flex items-center gap-2">
                            {agenda.university.logo_url && (
                                <img src={agenda.university.logo_url} alt={agenda.university.name} className="h-5 w-5 object-contain" />
                            )}
                            <span className="line-clamp-1 text-xs font-medium text-muted-foreground">{agenda.university.name}</span>
                        </div>
                    )}
                    <Badge variant="outline" className="hidden whitespace-nowrap capitalize shadow-sm sm:inline-flex">
                        {agenda.type}
                    </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg leading-snug font-bold">
                    <Link href={route('events.show', agenda.slug)} className="transition-colors hover:text-primary">
                        {agenda.title}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-grow flex-col justify-between pb-4">
                <div className="space-y-4">
                    <div className="space-y-2.5 text-sm text-foreground/80">
                        <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="line-clamp-1 capitalize">
                                {agenda.location_type.toLowerCase() === 'online'
                                    ? 'Online'
                                    : agenda.location_type.toLowerCase() === 'hybrid'
                                      ? `Hybrid - ${agenda.location_venue || 'TBA'}`
                                      : agenda.location_venue || 'Venue TBA'}
                            </span>
                        </div>
                    </div>

                    {/* Capacity */}
                    {agenda.quota && (
                        <div className="border-t border-border/50 pt-2">
                            <div className="flex items-center text-xs font-medium text-muted-foreground">Capacity: {agenda.quota} Participants</div>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="mt-auto flex items-center justify-between border-t bg-muted/30 pt-4">
                <div className="text-sm font-semibold">
                    {formatPrice(agenda.price, agenda.currency || 'IDR') === 'Free' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Free Event</span>
                    ) : (
                        formatPrice(agenda.price, agenda.currency || 'IDR')
                    )}
                </div>
                <Button asChild size="sm" className="rounded-full shadow-sm hover:shadow">
                    <Link href={route('events.show', agenda.slug)}>Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
