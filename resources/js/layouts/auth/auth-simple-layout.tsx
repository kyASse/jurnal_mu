import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 overflow-hidden">
            {/* Arctic/Aurora Background Animation */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div 
                    className="absolute top-0 left-10 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:mix-blend-normal dark:bg-primary/10"
                ></div>
                <div 
                    className="absolute top-0 right-10 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:mix-blend-normal dark:bg-secondary/10"
                    style={{ animationDelay: '2s' }}
                ></div>
                <div 
                    className="absolute -bottom-32 left-20 w-96 h-96 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:mix-blend-normal dark:bg-accent/10"
                    style={{ animationDelay: '4s' }}
                ></div>
            </div>

            <div className="w-full max-w-sm relative z-10">
                <div className="flex flex-col gap-6 backdrop-blur-md bg-white/40 dark:bg-slate-900/50 p-8 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                                <AppLogoIcon className="size-6 fill-current" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
