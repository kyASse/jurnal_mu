import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoiPaymentProofDropzoneProps {
    value: File | null;
    onChange: (file: File | null) => void;
    error?: string;
    maxSizeMb?: number;
    disabled?: boolean;
    className?: string;
}

const MAX_FILE_SIZE_DEFAULT = 5; // 5MB

function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function DoiPaymentProofDropzone({
    value,
    onChange,
    error,
    maxSizeMb = MAX_FILE_SIZE_DEFAULT,
    disabled = false,
    className,
}: DoiPaymentProofDropzoneProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [localError, setLocalError] = React.useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    React.useEffect(() => {
        if (!value) {
            setPreviewUrl(null);
            return;
        }

        if (value.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(value);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [value]);

    const handleFileValidation = (file: File): boolean => {
        setLocalError(null);

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setLocalError('Format file tidak didukung. Harap unggah file JPG, PNG, atau PDF.');
            return false;
        }

        if (file.size > maxSizeBytes) {
            setLocalError(`Ukuran file melebihi batas maksimal ${maxSizeMb}MB (${formatBytes(file.size)}).`);
            return false;
        }

        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (handleFileValidation(file)) {
                onChange(file);
            } else {
                if (inputRef.current) inputRef.current.value = '';
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (handleFileValidation(file)) {
                onChange(file);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalError(null);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const isPdf = value?.type === 'application/pdf' || value?.name?.toLowerCase().endsWith('.pdf');
    const displayError = localError || error;

    return (
        <div className={cn('space-y-2', className)}>
            <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled}
            />

            {!value ? (
                <div
                    onClick={() => !disabled && inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-300 hover:border-primary/50 hover:bg-muted/40 dark:border-slate-700 dark:hover:bg-muted/20',
                        displayError && 'border-rose-400 bg-rose-50/20 dark:border-rose-800 dark:bg-rose-950/20',
                        disabled && 'cursor-not-allowed opacity-60'
                    )}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                >
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                        <UploadCloud className="size-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                        Tarik & Lepas Bukti Transfer di sini, atau <span className="text-primary underline">Pilih File</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Mendukung format JPG, PNG, atau PDF (Maksimal {maxSizeMb}MB)
                    </p>
                </div>
            ) : (
                <div className="relative flex items-center justify-between rounded-lg border border-slate-200 bg-card p-3.5 shadow-xs dark:border-slate-800">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {previewUrl ? (
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                                <img
                                    src={previewUrl}
                                    alt="Preview Bukti Transfer"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : isPdf ? (
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
                                <FileText className="size-6" />
                            </div>
                        ) : (
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                <ImageIcon className="size-6" />
                            </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                                {value.name}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-muted-foreground">
                                    {formatBytes(value.size)}
                                </span>
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase">
                                    {isPdf ? 'PDF' : value.type.split('/')[1] || 'FILE'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                            disabled={disabled}
                            className="h-8 text-xs"
                        >
                            Ganti
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            disabled={disabled}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                            aria-label="Hapus file"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            {displayError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{displayError}</span>
                </div>
            )}
        </div>
    );
}
