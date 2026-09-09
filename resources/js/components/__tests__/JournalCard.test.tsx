import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import JournalCard from '../journal-card';

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

describe('JournalCard Theme Consistency', () => {
    it('should not contain hardcoded green hex #079C4E', () => {
        const cardPath = path.resolve(__dirname, '../journal-card.tsx');
        const content = fs.readFileSync(cardPath, 'utf8');

        expect(content).not.toContain('#079C4E');
        expect(content).not.toContain('#068a45');
    });

    it('should render journal title and theme buttons', () => {
        render(
            <JournalCard
                id={1}
                title="Jurnal Tarbiyah"
                sinta_rank="sinta_2"
                university="Universitas Ahmad Dahlan"
            />
        );
        expect(screen.getByText('Jurnal Tarbiyah')).toBeInTheDocument();
        expect(screen.getByText('View Journal')).toBeInTheDocument();
    });
});
