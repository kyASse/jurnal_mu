import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DoiSettingsData } from '@/types/doi';
import { router } from '@inertiajs/react';
import { Headphones, Mail, Phone, Clock, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoiHelpdeskSettingsCardProps {
    settings?: DoiSettingsData;
    className?: string;
}

export function DoiHelpdeskSettingsCard({ settings, className }: DoiHelpdeskSettingsCardProps) {
    const [email, setEmail] = React.useState(settings?.doi_helpdesk_email || 'jurnal@diktilitbangmuhammadiyah.org');
    const [phone, setPhone] = React.useState(settings?.doi_helpdesk_phone || '+62 812-3456-7890');
    const [hours, setHours] = React.useState(settings?.doi_helpdesk_hours || 'Senin - Jumat, 08:00 - 16:00 WIB');
    const [notes, setNotes] = React.useState(
        settings?.doi_helpdesk_notes ||
        'Hubungi Tim Layanan Jurnal & DOI Majelis Diktilitbang Pimpinan Pusat Muhammadiyah jika institusi Anda memerlukan penyesuaian khusus atau mengalami kendala deposit DOI.'
    );
    const [isSaving, setIsSaving] = React.useState(false);
    const [isSaved, setIsSaved] = React.useState(false);

    React.useEffect(() => {
        if (settings) {
            setEmail(settings.doi_helpdesk_email || 'jurnal@diktilitbangmuhammadiyah.org');
            setPhone(settings.doi_helpdesk_phone || '+62 812-3456-7890');
            setHours(settings.doi_helpdesk_hours || 'Senin - Jumat, 08:00 - 16:00 WIB');
            setNotes(settings.doi_helpdesk_notes || '');
        }
    }, [settings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setIsSaved(false);

        router.post(
            route('admin.doi-management.settings.update'),
            {
                doi_helpdesk_email: email,
                doi_helpdesk_phone: phone,
                doi_helpdesk_hours: hours,
                doi_helpdesk_notes: notes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 3000);
                },
                onError: () => {
                    setIsSaving(false);
                },
            }
        );
    };

    return (
        <Card className={cn('overflow-hidden border shadow-xs', className)}>
            <CardHeader className="border-b bg-muted/30 pb-4">
                <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Headphones className="size-4" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold">Pengaturan Kontak & Helpdesk Layanan DOI</CardTitle>
                        <CardDescription className="text-xs">
                            Informasi kontak bantuan yang ditampilkan pada Drawer rincian paket bagi Admin Kampus dan Pengelola Jurnal
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="doi_helpdesk_email" className="text-xs font-semibold flex items-center gap-1.5">
                                <Mail className="size-3.5 text-muted-foreground" />
                                Email Helpdesk
                            </Label>
                            <Input
                                id="doi_helpdesk_email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jurnal@diktilitbangmuhammadiyah.org"
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="doi_helpdesk_phone" className="text-xs font-semibold flex items-center gap-1.5">
                                <Phone className="size-3.5 text-muted-foreground" />
                                Hotline / WhatsApp
                            </Label>
                            <Input
                                id="doi_helpdesk_phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+62 812-3456-7890"
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="doi_helpdesk_hours" className="text-xs font-semibold flex items-center gap-1.5">
                                <Clock className="size-3.5 text-muted-foreground" />
                                Jam Operasional Layanan
                            </Label>
                            <Input
                                id="doi_helpdesk_hours"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                placeholder="Senin - Jumat, 08:00 - 16:00 WIB"
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="doi_helpdesk_notes" className="text-xs font-semibold">
                            Teks Pengantar Bantuan & Kustomisasi
                        </Label>
                        <Textarea
                            id="doi_helpdesk_notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Keterangan bantuan bagi institusi yang memerlukan kustomisasi paket..."
                            className="text-xs"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        {isSaved ? (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                <CheckCircle2 className="size-4" /> Pengaturan berhasil disimpan!
                            </span>
                        ) : <span />}

                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSaving}
                            className="h-8 gap-1.5 bg-primary text-xs text-primary-foreground shadow-2xs"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="size-3.5" />
                                    <span>Simpan Pengaturan Helpdesk</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
