import { Head, Link } from '@inertiajs/react';

export default function Error403() {
    return (
        <>
            <Head title="403 - Forbidden" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    {/* Icon */}
                    <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <svg
                            className="w-12 h-12 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className='text-6xl font-bold text-gray-900 mb-4'>
                        403
                    </h1>
                    <h2>
                        Access Forbidden
                    </h2>

                    {/* Message */}
                    <p className='text-gray-600 mb-8'>
                        You do not have permission to access this page.
                        Please contact the administrator if you believe this is a mistake.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/dashboard"
                            className='px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition'
                        >
                            Go to Dashboard
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}