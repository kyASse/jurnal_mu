import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { BookOpen, Check, Copy, ExternalLink, Fingerprint, ShieldCheck } from 'lucide-react';
import * as React from 'react';

interface DoiPrefixCardProps {
    prefix?: string | null;
    registeredJournalsCount?: number;
    crossrefUrl?: string;
    isVerified?: boolean;
    className?: string;
}

export function DoiPrefixCard({
    prefix,
    registeredJournalsCount = 0,
    crossrefUrl = 'https://doi.crossref.org',
    isVerified = true,
    className,
}: DoiPrefixCardProps) {
    const [copied, setCopied] = React.useState(false);

    const displayPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : 'Belum Ditentukan';
    const hasPrefix = Boolean(prefix);

    const handleCopy = async () => {
        if (!prefix) return;
        try {
            await navigator.clipboard.writeText(prefix);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy prefix:', err);
        }
    };

    return (
        <Card className={cn('relative overflow-hidden border-border/80 shadow-xs transition-all hover:shadow-md', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                            <Fingerprint className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-foreground">Prefix Crossref</CardTitle>
                            <CardDescription className="text-xs">Identitas DOI Resmi Institusi</CardDescription>
                        </div>
                    </div>
                    {hasPrefix && isVerified && (
                        <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        >
                            <ShieldCheck className="mr-1 size-3" />
                            Terverifikasi
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Prefix Monospace Display Box */}
                <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 p-2.5 transition-colors dark:bg-muted/20">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="font-mono text-base font-bold tracking-wider text-foreground sm:text-lg">{displayPrefix}</span>
                    </div>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!hasPrefix}
                                    onClick={handleCopy}
                                    className="h-8 gap-1.5 px-2.5 text-xs shadow-2xs transition-all"
                                    aria-label="Salin Prefix Crossref"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-3.5 text-muted-foreground" />
                                            <span>Salin</span>
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">{copied ? 'Berhasil disalin ke clipboard' : 'Salin prefix ke clipboard'}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="space-y-1 rounded-md border border-border/50 bg-background/50 p-2">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <BookOpen className="size-3" />
                            Jurnal Terdaftar
                        </span>
                        <p className="font-mono text-sm font-bold text-foreground tabular-nums">
                            {registeredJournalsCount} <span className="text-xs font-normal text-muted-foreground">Jurnal</span>
                        </p>
                    </div>

                    <div className="space-y-1 rounded-md border border-border/50 bg-background/50 p-2">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <ShieldCheck className="size-3" />
                            Status Registrasi
                        </span>
                        <p className="truncate text-xs font-medium text-foreground">{hasPrefix ? 'Aktif di Crossref' : 'Menunggu Prefix'}</p>
                    </div>
                </div>

                {/* External Crossref Portal Link */}
                <div className="pt-1">
                    <a
                        href={crossrefUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border/80 bg-background/60 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                        <span>Buka Crossref Metadata Manager</span>
                        <ExternalLink className="size-3" />
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
