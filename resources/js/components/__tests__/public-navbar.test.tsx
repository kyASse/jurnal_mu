import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import PublicNavbar from '../public-navbar';

beforeAll(() => {
    (globalThis as any).route = (name: string, params?: any) => `/route/${name}/${params || ''}`;
});

vi.mock('@inertiajs/react', () => {
    return {
        Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
        usePage: () => ({
            props: {
                auth: { user: null },
            },
        }),
    };
});

describe('PublicNavbar', () => {
    it('renders navigation links including News', () => {
        render(<PublicNavbar />);
        expect(screen.getByText('Journals')).toBeInTheDocument();
        expect(screen.getByText('Articles')).toBeInTheDocument();
        expect(screen.getByText('Universities')).toBeInTheDocument();
        expect(screen.getByText('News')).toBeInTheDocument();
    });
});
