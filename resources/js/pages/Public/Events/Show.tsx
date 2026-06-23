import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    Copy,
    ExternalLink,
    Globe,
    Link2,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Share2,
    Twitter,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/utils/price';

interface AgendaDetails {
    id: number;
    title: string;
    type: string;
    description: string;
    thumbnail_url: string | null;
    date_start: string | null;
    date_end: string | null;
    time_start: string | null;
    time_end: string | null;
    location_type: string;
    location_venue: string | null;
    location_link: string | null;
    registration_link: string | null;
    price: string | null;
    currency?: string | null;
    contact_person_name: string | null;
    contact_person_phone: string | null;
    contact_person_email: string | null;
    is_featured: boolean;
    university: {
        name: string;
        short_name: string | null;
        logo_url: string | null;
        website_url: string | null;
    } | null;
}

interface Props {
    agenda: AgendaDetails;
}

export default function Show({ agenda }: Props) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'TBA';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const [countdown, setCountdown] = useState<{ days: number; hours: number; mins: number; secs: number } | null>(null);
    const [eventStarted, setEventStarted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!agenda.date_start) return;

        const updateCountdown = () => {
            const startDateTime = new Date(`${agenda.date_start}T${agenda.time_start || '00:00'}:00+07:00`);
            const now = new Date();
            const diff = startDateTime.getTime() - now.getTime();

            if (diff <= 0) {
                setEventStarted(true);
                setCountdown(null);
                return;
            }

            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                secs: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [agenda.date_start, agenda.time_start]);

    const generateGoogleCalendarUrl = () => {
        if (!agenda.date_start) return '#';

        const formatForGCal = (dateStr: string, timeStr: string | null) => {
            const d = new Date(`${dateStr}T${timeStr || '00:00'}`);
            return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
        };

        const start = formatForGCal(agenda.date_start, agenda.time_start);
        // If no end date, default to start date + 1 hour
        const end = formatForGCal(
            agenda.date_end || agenda.date_start,
            agenda.time_end || (agenda.time_start ? `${parseInt(agenda.time_start.split(':')[0]) + 1}:00` : '01:00'),
        );

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: agenda.title,
            details: `${agenda.description}\n\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`,
            location: agenda.location_venue || agenda.location_type,
            dates: `${start}/${end}`,
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    const copyToClipboard = () => {
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = currentUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const shareUrl = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
    const shareTitle = encodeURIComponent(agenda.title);

    return (
        <PublicLayout>
            <Head title={`${agenda.title} - Events & Agendas`} />

            {/* Minimalist Hero Background Overlay */}
            <div className="border-b bg-primary/5 pt-8 pb-12">
                <div className="container mx-auto px-4 lg:px-8">
                    <Link
                        href={route('events.index')}
                        className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Events
                    </Link>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Title & Info section */}
                        <div className="flex flex-col justify-center lg:col-span-2">
                            <div className="mb-4 flex items-center gap-2">
                                <Badge variant="secondary" className="px-3 py-1 text-sm capitalize shadow-sm">
                                    {agenda.type}
                                </Badge>
                                {agenda.is_featured && (
                                    <Badge variant="default" className="px-3 py-1 text-sm shadow-sm">
                                        Featured
                                    </Badge>
                                )}
                            </div>

                            <h1 className="mb-6 text-3xl leading-tight font-extrabold tracking-tight text-foreground md:text-5xl">{agenda.title}</h1>

                            <div className="mt-4 flex flex-wrap items-center gap-6 text-foreground/80">
                                {agenda.university && (
                                    <div className="flex items-center gap-3">
                                        {agenda.university.logo_url && (
                                            <div className="h-10 w-10 overflow-hidden rounded-full border bg-white p-1 shadow-sm">
                                                <img
                                                    src={agenda.university.logo_url}
                                                    alt={agenda.university.name}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Organized by</span>
                                            <span className="font-semibold">{agenda.university.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail / Image Area */}
                        {agenda.thumbnail_url && (
                            <div className="aspect-[4/3] flex-shrink-0 overflow-hidden rounded-xl border bg-muted shadow-lg lg:col-span-1 lg:aspect-square">
                                <img src={agenda.thumbnail_url} alt={agenda.title} className="h-full w-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative z-10 container mx-auto -mt-10 px-4 py-12 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                    {/* Main Content Area */}
                    <div className="space-y-8 lg:col-span-2">
                        <Card className="overflow-hidden shadow-md">
                            <CardHeader className="border-b bg-muted/30 pb-4">
                                <CardTitle className="text-xl">About the Event</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="max-w-none text-sm leading-7 break-words whitespace-pre-line text-foreground">
                                    {agenda.description || 'No description provided.'}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Registration Call to Action area inside content (fallback or complementary) */}
                        {!agenda.registration_link && (
                            <Card className="border-dashed border-primary/20 bg-primary/5">
                                <CardContent className="flex flex-col items-center justify-center pt-6 text-center">
                                    <h3 className="mb-2 text-lg font-semibold">Registration Link Unavailable</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Please check the description or contact the organizer for registration details.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar / Sticky Info Panel */}
                    <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-1">
                        <Card className="relative overflow-hidden border-primary/10 shadow-lg">
                            {/* Accent line on top of card */}
                            <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-primary" />

                            <CardContent className="divide-y divide-border/50 px-6 pt-8 pb-6">
                                {/* Price and Action */}
                                <div className="pb-6">
                                    <div className="mb-6 flex items-end justify-between">
                                        <div>
                                            <p className="mb-1 text-sm font-medium tracking-wide text-muted-foreground uppercase">Registration</p>
                                            <span className="text-3xl font-bold tracking-tight">
                                                {formatPrice(agenda.price, agenda.currency || 'IDR') === 'Free' ? (
                                                    <span className="text-emerald-600">Free</span>
                                                ) : (
                                                    formatPrice(agenda.price, agenda.currency || 'IDR')
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {agenda.registration_link ? (
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-14 w-full text-lg font-semibold shadow-md transition-all hover:-translate-y-0.5"
                                        >
                                            <a href={agenda.registration_link} target="_blank" rel="noopener noreferrer">
                                                Register Now
                                                <ExternalLink className="ml-2 h-5 w-5" />
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button disabled size="lg" className="h-14 w-full cursor-not-allowed text-lg font-semibold opacity-50">
                                            Registration Closed
                                        </Button>
                                    )}

                                    {/* Countdown Timer */}
                                    {countdown && !eventStarted && (
                                        <div className="mt-6 rounded-xl border border-primary/10 bg-primary/5 p-4">
                                            <p className="mb-2 text-center text-xs font-semibold tracking-wider text-primary uppercase">Starts In</p>
                                            <div className="flex justify-center gap-3 text-center">
                                                <div className="flex w-12 flex-col rounded-md bg-white p-2 shadow-sm dark:bg-zinc-900">
                                                    <span className="text-xl font-bold">{countdown.days}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">Days</span>
                                                </div>
                                                <div className="flex w-12 flex-col rounded-md bg-white p-2 shadow-sm dark:bg-zinc-900">
                                                    <span className="text-xl font-bold">{countdown.hours}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">Hrs</span>
                                                </div>
                                                <div className="flex w-12 flex-col rounded-md bg-white p-2 shadow-sm dark:bg-zinc-900">
                                                    <span className="text-xl font-bold">{countdown.mins}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">Mins</span>
                                                </div>
                                                <div className="flex w-12 flex-col rounded-md bg-white p-2 shadow-sm dark:bg-zinc-900">
                                                    <span className="text-xl font-bold text-primary">{countdown.secs}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">Secs</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {eventStarted && (
                                        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-900/50 dark:bg-green-900/20">
                                            <p className="font-semibold text-green-700 dark:text-green-400">Event has started!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Date & Time */}
                                <div className="space-y-4 py-5">
                                    <div className="flex gap-4">
                                        <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                                            <CalendarDays className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-muted-foreground">Date</p>
                                                {agenda.date_start && (
                                                    <a
                                                        href={generateGoogleCalendarUrl()}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                                    >
                                                        <CalendarDays className="h-3 w-3" />
                                                        Add to Calendar
                                                    </a>
                                                )}
                                            </div>
                                            <p className="mt-0.5 font-semibold">{formatDate(agenda.date_start)}</p>
                                            {agenda.date_end && agenda.date_end !== agenda.date_start && (
                                                <p className="font-semibold text-muted-foreground">to {formatDate(agenda.date_end)}</p>
                                            )}
                                        </div>
                                    </div>

                                    {(agenda.time_start || agenda.time_end) && (
                                        <div className="flex gap-4">
                                            <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                                                <Clock className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Time</p>
                                                <p className="mt-0.5 font-semibold">
                                                    {agenda.time_start || '?'}
                                                    {agenda.time_end && ` - ${agenda.time_end}`}
                                                    <span className="ml-1 text-xs font-normal text-muted-foreground">WIB</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Location Area */}
                                <div className="space-y-4 py-5">
                                    <div className="flex gap-4">
                                        <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Location</p>
                                            <div className="mt-1">
                                                <Badge variant="outline" className="mb-2 capitalize">
                                                    {agenda.location_type}
                                                </Badge>
                                                {agenda.location_venue && <p className="font-medium">{agenda.location_venue}</p>}
                                                {agenda.location_link && (
                                                    <a
                                                        href={agenda.location_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 inline-flex items-center text-sm font-medium break-all text-primary hover:underline"
                                                    >
                                                        <Globe className="mr-1 h-3.5 w-3.5 shrink-0" />
                                                        View Location / Map
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Share Card */}
                        <Card className="border-muted shadow-sm">
                            <CardHeader className="bg-muted/20 pb-3">
                                <CardTitle className="flex items-center text-base">
                                    <Share2 className="mr-2 h-4 w-4 text-primary" />
                                    Share this Event
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full border-muted-foreground/20 hover:bg-[#25D366] hover:text-white"
                                    >
                                        <a
                                            href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Share on WhatsApp"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full border-muted-foreground/20 hover:bg-[#1DA1F2] hover:text-white"
                                    >
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Share on Twitter"
                                        >
                                            <Twitter className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button
                                        onClick={copyToClipboard}
                                        variant="outline"
                                        className="flex-1 rounded-full border-muted-foreground/20 font-medium"
                                    >
                                        {copied ? (
                                            <span className="flex items-center text-emerald-600">
                                                <Copy className="mr-2 h-4 w-4" /> Copied!
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <Link2 className="mr-2 h-4 w-4" /> Copy Link
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Person Card */}
                        {(agenda.contact_person_name || agenda.contact_person_phone || agenda.contact_person_email) && (
                            <Card className="border-muted shadow-sm">
                                <CardHeader className="bg-muted/20 pb-3">
                                    <CardTitle className="flex items-center text-base">
                                        <User className="mr-2 h-4 w-4 text-primary" />
                                        Contact Person
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-4">
                                    {agenda.contact_person_name && <p className="font-semibold text-foreground">{agenda.contact_person_name}</p>}
                                    {agenda.contact_person_phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`https://wa.me/${agenda.contact_person_phone.replace(/[^0-9]/g, '')}`}
                                                className="transition-colors hover:text-primary"
                                            >
                                                {agenda.contact_person_phone}
                                            </a>
                                        </div>
                                    )}
                                    {agenda.contact_person_email && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`mailto:${agenda.contact_person_email}`}
                                                className="break-all transition-colors hover:text-primary"
                                            >
                                                {agenda.contact_person_email}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
