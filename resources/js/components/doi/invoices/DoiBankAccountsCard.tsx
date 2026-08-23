import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DoiBankAccountData } from '@/types/doi';
import { Building2, Check, Copy, Info, Landmark } from 'lucide-react';
import * as React from 'react';

interface DoiBankAccountsCardProps {
    bankAccounts?: DoiBankAccountData[];
    invoiceNumber?: string;
    className?: string;
}

const DEFAULT_BANK_ACCOUNTS: DoiBankAccountData[] = [
    {
        id: 1,
        bank_name: 'Bank Syariah Indonesia (BSI)',
        account_number: '7148560001',
        account_holder: 'Majelis Diktilitbang PPM',
        branch_name: 'KC Jakarta Menteng',
        is_active: true,
    },
    {
        id: 2,
        bank_name: 'Bank Mandiri',
        account_number: '1230009876543',
        account_holder: 'PP Muhammadiyah Diktilitbang',
        branch_name: 'KK Jakarta Kramat Raya',
        is_active: true,
    },
];

export function DoiBankAccountsCard({ bankAccounts, invoiceNumber, className }: DoiBankAccountsCardProps) {
    const [copiedAccount, setCopiedAccount] = React.useState<string | null>(null);
    const [copiedInvoice, setCopiedInvoice] = React.useState(false);

    const accounts = bankAccounts && bankAccounts.length > 0 ? bankAccounts : DEFAULT_BANK_ACCOUNTS;

    const handleCopy = (text: string, type: 'account' | 'invoice') => {
        navigator.clipboard.writeText(text);
        if (type === 'account') {
            setCopiedAccount(text);
            setTimeout(() => setCopiedAccount(null), 2000);
        } else {
            setCopiedInvoice(true);
            setTimeout(() => setCopiedInvoice(false), 2000);
        }
    };

    return (
        <Card className={cn('overflow-hidden border-slate-200 shadow-xs dark:border-slate-800', className)}>
            <CardHeader className="bg-muted/40 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Landmark className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold sm:text-base">Rekening Pembayaran Resmi</CardTitle>
                            <CardDescription className="text-xs">Transfer hanya ke rekening resmi Diktilitbang PPM berikut</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-primary/30 bg-primary/5 text-[11px] text-primary">
                        Verifikasi Manual
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {accounts.map((account) => {
                        const isCopied = copiedAccount === account.account_number;
                        return (
                            <div
                                key={account.id || account.account_number}
                                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-card p-3.5 transition-all hover:border-primary/40 dark:border-slate-800 dark:hover:border-primary/40"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground sm:text-sm">
                                            <Building2 className="size-3.5 text-muted-foreground" />
                                            {account.bank_name}
                                        </div>
                                        {(account.branch_name || account.branch) && (
                                            <span className="max-w-[120px] truncate text-[10px] text-muted-foreground">
                                                {account.branch_name || account.branch}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5 dark:bg-muted/20">
                                        <span className="font-mono text-sm font-bold tracking-wider text-foreground tabular-nums sm:text-base">
                                            {account.account_number}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopy(account.account_number, 'account')}
                                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                            aria-label={`Salin nomor rekening ${account.bank_name}`}
                                        >
                                            {isCopied ? (
                                                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <Copy className="size-3.5" />
                                            )}
                                            <span className="ml-1 text-[11px]">{isCopied ? 'Tersalin' : 'Salin'}</span>
                                        </Button>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        a.n. <span className="font-medium text-foreground">{account.account_holder}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Transfer reference instructions */}
                <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    <div className="flex items-start gap-2">
                        <Info className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div className="space-y-1">
                            <p className="font-semibold">Petunjuk Berita Transfer:</p>
                            <p className="leading-relaxed">
                                Cantumkan <span className="font-semibold">Nomor Tagihan/Faktur</span> pada kolom berita/keterangan transfer untuk
                                mempercepat proses verifikasi.
                            </p>
                            {invoiceNumber && (
                                <div className="mt-1 flex items-center gap-2 pt-1">
                                    <span className="text-[11px] text-muted-foreground">Nomor Faktur Anda:</span>
                                    <code className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px] font-bold text-foreground">
                                        {invoiceNumber}
                                    </code>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCopy(invoiceNumber, 'invoice')}
                                        className="h-6 px-1.5 text-[10px]"
                                    >
                                        {copiedInvoice ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                                        <span className="ml-1">{copiedInvoice ? 'Tersalin' : 'Salin Faktur'}</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
