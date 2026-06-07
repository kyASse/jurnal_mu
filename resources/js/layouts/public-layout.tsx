import PublicFooter from '@/components/public-footer';
import PublicNavbar from '@/components/public-navbar';
import { PropsWithChildren } from 'react';

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-[#1b1b18] selection:bg-[#079C4E] selection:text-white dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            {/* NAVBAR */}
            <PublicNavbar />

            {/* MAIN CONTENT */}
            <main className="flex-1 pt-16">{children}</main>

            {/* FOOTER */}
            <PublicFooter />
        </div>
    );
}

