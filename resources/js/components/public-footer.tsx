import { Link, usePage } from '@inertiajs/react';

interface PageProps {
    laravelVersion?: string;
    phpVersion?: string;
}

export default function PublicFooter() {
    const { laravelVersion, phpVersion } = usePage<{ props: PageProps }>().props as any;

    return (
        <footer className="bg-[#0f172a] py-12 text-center text-sm text-gray-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-center gap-6">
                    <Link href={route('home')} className="hover:text-white">
                        Home
                    </Link>
                    <a href="#" className="hover:text-white">
                        About Us
                    </a>
                    <a href="#" className="hover:text-white">
                        Privacy Policy
                    </a>
                    <a href="#" className="hover:text-white">
                        Contact Support
                    </a>
                </div>
                <p>&copy; {new Date().getFullYear()} JurnalMu - Muhammadiyah Higher Education Research Network.</p>
                {laravelVersion && phpVersion && (
                    <p className="mt-2 text-xs text-gray-600">
                        Laravel v{laravelVersion} (PHP v{phpVersion})
                    </p>
                )}
            </div>
        </footer>
    );
}
