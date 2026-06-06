import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FileUp } from 'lucide-react';
import { useState } from 'react';

interface ImportXmlDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    journalId: number;
    uploadRoute: string;
}

export function ImportXmlDialog({ open, onOpenChange, journalId, uploadRoute }: ImportXmlDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        xml_file: null as File | null,
        duplicate_strategy: 'skip',
    });
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('xml_file', file);
            setFileName(file.name);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route(uploadRoute, journalId), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                setFileName('');
            },
            preserveScroll: true,
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                onOpenChange(val);
                if (!val) {
                    reset();
                    setFileName('');
                }
            }}
        >
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Import Artikel via XML</DialogTitle>
                        <DialogDescription>
                            Pilih file XML deposit CrossRef (OJS 2 / OJS 3) untuk memproses data artikel jurnal ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="xml_file" className="text-sm font-medium">
                                File XML CrossRef <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-6 hover:bg-accent/10">
                                <input
                                    id="xml_file"
                                    type="file"
                                    accept=".xml"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    required
                                />
                                <FileUp className="mb-2 h-8 w-8 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                    {fileName || 'Seret file ke sini atau klik untuk memilih'}
                                </span>
                                <span className="mt-1 text-xs text-muted-foreground">Hanya file .xml maksimal 10MB</span>
                            </div>
                            {errors.xml_file && <p className="mt-1 text-sm text-red-500">{errors.xml_file}</p>}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium">
                                Penanganan Artikel Duplikat <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent/10">
                                    <input
                                        type="radio"
                                        name="duplicate_strategy"
                                        value="skip"
                                        checked={data.duplicate_strategy === 'skip'}
                                        onChange={(e) => setData('duplicate_strategy', e.target.value)}
                                        className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Lewati Duplikat</span>
                                        <span className="text-xs text-muted-foreground">Skip jika data ada</span>
                                    </div>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-accent/10">
                                    <input
                                        type="radio"
                                        name="duplicate_strategy"
                                        value="update"
                                        checked={data.duplicate_strategy === 'update'}
                                        onChange={(e) => setData('duplicate_strategy', e.target.value)}
                                        className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Perbarui Data</span>
                                        <span className="text-xs text-muted-foreground">Overwrite data lama</span>
                                    </div>
                                </label>
                            </div>
                            {errors.duplicate_strategy && <p className="mt-1 text-sm text-red-500">{errors.duplicate_strategy}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.xml_file}>
                            {processing ? 'Memproses...' : 'Mulai Import'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
