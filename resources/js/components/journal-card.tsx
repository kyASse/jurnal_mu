import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

interface JournalCardProps {
    id: number;
    title: string;
    issn?: string | null;
    e_issn?: string | null;
    sinta_rank?: number | null;
    university?: string;
    coverColor?: string; // Optional color for the card header pattern
}

export default function JournalCard({
    id,
    title,
    issn,
    e_issn,
    sinta_rank,
    university = 'Universitas Muhammadiyah',
    coverColor = 'bg-[#079C4E]', // Default to Official Green
}: JournalCardProps) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-zinc-900">
            {/* Decorative Header / Cover Placeholder */}
            <div className={`h-24 w-full ${coverColor} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
                <div className="absolute -top-8 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:bg-white/20" />
                <div className="absolute bottom-0 left-0 p-4">
                    <div className="rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-gray-900 backdrop-blur-sm">{university}</div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                {/* Sinta Badge */}
                <div className="mb-3 flex items-start justify-between">
                    {sinta_rank ? (
                        <Badge
                            className={` ${sinta_rank <= 2 ? 'bg-[#E11A1F] text-white hover:bg-[#c4151a]' : ''} ${sinta_rank >= 3 && sinta_rank <= 4 ? 'bg-[#FCEE1F] text-black hover:bg-[#e3d51b]' : ''} ${sinta_rank >= 5 ? 'bg-[#1A2A75] text-white hover:bg-[#131f57]' : ''} border-0 px-2.5 py-0.5 font-bold`}
                        >
                            SINTA {sinta_rank}
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="text-gray-500">
                            Not Indexed
                        </Badge>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-heading mb-2 line-clamp-2 text-xl leading-tight font-bold text-gray-900 transition-colors group-hover:text-[#079C4E] dark:text-white">
                    <Link href={route('journals.show', id)}>{title}</Link>
                </h3>

                {/* ISSN Info */}
                <div className="mt-auto space-y-1 pt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                        <span>P-ISSN</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-gray-200">{issn || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>E-ISSN</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-gray-200">{e_issn || '-'}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-2">
                    <Button asChild className="w-full bg-[#079C4E] font-semibold text-white hover:bg-[#068a45]">
                        <Link href={route('journals.show', id)}>View Journal</Link>
                    </Button>
                    <Button asChild variant="outline" size="icon" className="shrink-0 border-[#079C4E]/20 text-[#079C4E] hover:bg-[#079C4E]/10">
                        <a href="#" title="More options">
                            <BookOpen className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
