import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

interface SintaBadgeProps {
    rank: number | null;
    indexed_date?: string | null;
    showDate?: boolean;
}

export default function SintaBadge({ rank, indexed_date, showDate = false }: SintaBadgeProps) {
    if (!rank) {
        return (
            <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-600">
                <Award className="mr-1 h-3 w-3" />
                Belum Terindeks SINTA
            </Badge>
        );
    }

    // Color mapping for SINTA ranks
    const colors = {
        1: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
        2: 'bg-red-500 text-white border-red-600 hover:bg-red-600',
        3: 'bg-yellow-500 text-gray-900 border-yellow-600 hover:bg-yellow-600',
        4: 'bg-yellow-400 text-gray-900 border-yellow-500 hover:bg-yellow-500',
        5: 'bg-blue-900 text-white border-blue-950 hover:bg-blue-950',
        6: 'bg-blue-800 text-white border-blue-900 hover:bg-blue-900',
    };

    const colorClass = colors[rank as keyof typeof colors] || 'bg-gray-500 text-white';

    return (
        <div className="flex flex-col gap-1">
            <Badge className={`${colorClass} font-semibold`}>
                <Award className="mr-1 h-3 w-3" />
                SINTA {rank}
            </Badge>
            {showDate && indexed_date && (
                <span className="text-xs text-gray-500">
                    Terindeks:{' '}
                    {new Date(indexed_date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                </span>
            )}
        </div>
    );
}
