import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Award, CheckCircle } from 'lucide-react';

interface AccreditationBadgeProps {
    number?: string | null;
    grade?: string | null;
    expiry_status?: 'valid' | 'expiring_soon' | 'expired' | 'none';
    expiry_date?: string | null;
    showDetails?: boolean;
}

export default function AccreditationBadge({ number, grade, expiry_status = 'none', expiry_date, showDetails = false }: AccreditationBadgeProps) {
    if (!number) {
        return (
            <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-600">
                <AlertCircle className="mr-1 h-3 w-3" />
                Belum Terakreditasi Dikti
            </Badge>
        );
    }

    // Status-based styling
    const statusConfig = {
        valid: {
            color: 'bg-green-600 text-white border-green-700 hover:bg-green-700',
            icon: CheckCircle,
            label: 'Aktif',
        },
        expiring_soon: {
            color: 'bg-yellow-500 text-gray-900 border-yellow-600 hover:bg-yellow-600',
            icon: AlertTriangle,
            label: 'Segera Berakhir',
        },
        expired: {
            color: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
            icon: AlertCircle,
            label: 'Kedaluwarsa',
        },
        none: {
            color: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700',
            icon: Award,
            label: 'Terakreditasi',
        },
    };

    const config = statusConfig[expiry_status];
    const Icon = config.icon;

    return (
        <div className="flex flex-col gap-1">
            <Badge className={`${config.color} font-semibold`}>
                <Icon className="mr-1 h-3 w-3" />
                {grade ? `Akreditasi ${grade}` : 'Terakreditasi Dikti'}
            </Badge>
            {showDetails && (
                <div className="space-y-0.5 text-xs">
                    <div className="font-medium text-gray-700">No. {number}</div>
                    {expiry_date && (
                        <div
                            className={` ${expiry_status === 'expired' ? 'text-red-600' : ''} ${expiry_status === 'expiring_soon' ? 'text-yellow-700' : ''} ${expiry_status === 'valid' ? 'text-gray-600' : ''} `}
                        >
                            {expiry_status === 'expired' ? 'Berakhir: ' : 'Berlaku hingga: '}
                            {new Date(expiry_date).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                    )}
                    {expiry_status === 'expiring_soon' && expiry_date && (
                        <div className="font-medium text-yellow-700">
                            ⚠️ {Math.ceil((new Date(expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} hari lagi
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
