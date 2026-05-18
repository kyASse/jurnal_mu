import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

interface EditOaiUrlDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    journalId: number;
    initialUrls: string[] | null;
    updateRoute: string;
}

export function EditOaiUrlDialog({ open, onOpenChange, journalId, initialUrls, updateRoute }: EditOaiUrlDialogProps) {
    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        oai_urls: initialUrls && initialUrls.length > 0 ? initialUrls : [''],
    });

    useEffect(() => {
        if (open) {
            setData('oai_urls', initialUrls && initialUrls.length > 0 ? initialUrls : ['']);
            clearErrors();
        }
    }, [open, initialUrls]);

    const handleAddUrl = () => {
        setData('oai_urls', [...data.oai_urls, '']);
    };

    const handleRemoveUrl = (index: number) => {
        const newUrls = [...data.oai_urls];
        newUrls.splice(index, 1);
        setData('oai_urls', newUrls.length > 0 ? newUrls : ['']);
    };

    const handleUrlChange = (index: number, value: string) => {
        const newUrls = [...data.oai_urls];
        newUrls[index] = value;
        setData('oai_urls', newUrls);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route(updateRoute, journalId), {
            onSuccess: () => onOpenChange(false),
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Perbaiki OAI-PMH URL</DialogTitle>
                        <DialogDescription>
                            Edit URL endpoint OAI-PMH untuk jurnal ini. Pastikan URL tersebut valid dan dapat diakses.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <Label>OAI-PMH URLs <span className="text-red-500">*</span></Label>
                            {data.oai_urls.map((url, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="url"
                                            value={url}
                                            onChange={(e) => handleUrlChange(index, e.target.value)}
                                            placeholder="https://example.com/index.php/journal/oai"
                                            required
                                        />
                                        {data.oai_urls.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                                onClick={() => handleRemoveUrl(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {errors[`oai_urls.${index}`] && (
                                        <p className="text-sm text-red-500">{errors[`oai_urls.${index}`]}</p>
                                    )}
                                </div>
                            ))}
                            {errors.oai_urls && <p className="text-sm text-red-500">{errors.oai_urls}</p>}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddUrl}
                                className="w-full border-dashed"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah URL
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
