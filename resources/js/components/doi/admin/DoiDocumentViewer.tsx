import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, Download, ExternalLink, Eye, FileText, Maximize2, Minimize2, RefreshCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import * as React from 'react';

interface DoiDocumentViewerProps {
    src?: string | null;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    className?: string;
    maxHeight?: string | number;
}

export function formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function DoiDocumentViewer({ src, fileName = 'Bukti_Transfer', mimeType, fileSize, className, maxHeight = 480 }: DoiDocumentViewerProps) {
    const [scale, setScale] = React.useState<number>(1);
    const [rotation, setRotation] = React.useState<number>(0);
    const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
    const [hasError, setHasError] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    const isPdf =
        (mimeType && mimeType.includes('pdf')) ||
        (fileName && fileName.toLowerCase().endsWith('.pdf')) ||
        (src && src.toLowerCase().includes('.pdf'));

    React.useEffect(() => {
        setScale(1);
        setRotation(0);
        setHasError(false);
        setIsLoading(true);
    }, [src]);

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleReset = () => {
        setScale(1);
        setRotation(0);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!src) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-muted/20 p-6 text-center dark:border-slate-800">
                <FileText className="size-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">Tidak ada file bukti pembayaran terlampir</p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-950 text-slate-100 dark:border-slate-800',
                isFullscreen && 'fixed inset-0 z-50 rounded-none border-none',
                className,
            )}
        >
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-3 py-2 text-xs backdrop-blur-xs">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-mono font-medium text-slate-200" title={fileName}>
                        {fileName}
                    </span>
                    {fileSize ? (
                        <Badge variant="outline" className="border-slate-700 bg-slate-800 text-[10px] text-slate-400">
                            {formatFileSize(fileSize)}
                        </Badge>
                    ) : null}
                    {isPdf && (
                        <Badge variant="outline" className="border-rose-900 bg-rose-950/80 text-[10px] text-rose-300">
                            PDF
                        </Badge>
                    )}
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-1">
                    {!isPdf && (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomOut}
                                disabled={scale <= 0.5}
                                title="Perkecil (-)"
                                className="size-7 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                <ZoomOut className="size-3.5" />
                            </Button>

                            <span className="min-w-10 text-center font-mono text-[11px] text-slate-400">{Math.round(scale * 100)}%</span>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomIn}
                                disabled={scale >= 3}
                                title="Perbesar (+)"
                                className="size-7 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                <ZoomIn className="size-3.5" />
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleRotate}
                                title="Putar 90°"
                                className="size-7 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                <RotateCw className="size-3.5" />
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleReset}
                                title="Atur Ulang"
                                className="size-7 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                <RefreshCcw className="size-3.5" />
                            </Button>
                        </>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                        className="size-7 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                    </Button>

                    <a
                        href={src}
                        download={fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex size-7 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800 hover:text-white"
                        title="Unduh / Buka Dokumen Asli"
                    >
                        <Download className="size-3.5" />
                    </a>
                </div>
            </div>

            {/* Viewer Canvas */}
            <div
                className={cn(
                    'relative flex flex-1 items-center justify-center overflow-auto bg-slate-950 p-4 transition-all',
                    !isFullscreen && 'min-h-[280px]',
                )}
                style={{
                    maxHeight: isFullscreen ? 'calc(100vh - 48px)' : maxHeight,
                    height: isFullscreen ? 'calc(100vh - 48px)' : undefined,
                }}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                        <div className="flex flex-col items-center gap-2">
                            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span className="text-xs text-slate-400">Memuat berkas bukti...</span>
                        </div>
                    </div>
                )}

                {hasError ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-400">
                        <AlertCircle className="size-10 text-rose-500" />
                        <div>
                            <p className="text-sm font-medium text-slate-200">Gagal memuat pratinjau dokumen</p>
                            <p className="text-xs text-slate-400">Berkas mungkin berformat khusus atau dibatasi keamanannya.</p>
                        </div>
                        <a
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
                        >
                            <ExternalLink className="size-3.5" /> Buka di Tab Baru
                        </a>
                    </div>
                ) : isPdf ? (
                    <div className="flex size-full min-h-[360px] flex-col">
                        <iframe
                            src={`${src}#toolbar=1&navpanes=0`}
                            title={fileName}
                            className="size-full flex-1 rounded-lg border-0 bg-white"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setHasError(true);
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex size-full items-center justify-center overflow-auto">
                        <img
                            src={src}
                            alt={fileName}
                            style={{
                                transform: `scale(${scale}) rotate(${rotation}deg)`,
                                transition: 'transform 0.15s ease-out',
                            }}
                            className="max-h-full max-w-full rounded-md object-contain shadow-2xl"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setHasError(true);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Bottom quick action footer */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/60 px-3 py-1.5 text-[11px] text-slate-400">
                <span>Klik ikon unduh untuk menyimpan file asli</span>
                <a href={src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-foreground hover:underline">
                    <Eye className="size-3" /> Buka Tab Penuh
                </a>
            </div>
        </div>
    );
}
