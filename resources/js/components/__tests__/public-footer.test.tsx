import { render, screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import PublicFooter from '../public-footer';

beforeAll(() => {
    (globalThis as any).route = (name: string, params?: any) => `/route/${name}`;
});

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('PublicFooter Anti-Slop & A11y', () => {
    it('should not contain em-dashes (&mdash; or —)', () => {
        const footerPath = path.resolve(__dirname, '../public-footer.tsx');
        const content = fs.readFileSync(footerPath, 'utf8');

        expect(content).not.toContain('&mdash;');
        expect(content).not.toContain('—');
    });

    it('should render copyright and links', () => {
        render(<PublicFooter />);
        expect(screen.getByText(/JournalMU/i)).toBeInTheDocument();
        expect(screen.getByText(/Majelis Diktilitbang Muhammadiyah/i)).toBeInTheDocument();
    });
});
