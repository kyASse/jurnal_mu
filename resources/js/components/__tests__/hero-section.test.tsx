import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import HeroSection from '../hero-section';

beforeAll(() => {
    (globalThis as any).route = (name: string, _params?: any) => `/route/${name}`;
});

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('HeroSection', () => {
    const mockProps = {
        totalJournals: 120,
        totalArticles: 4500,
        totalUniversities: 35,
        searchQuery: '',
        setSearchQuery: vi.fn(),
        searchType: 'journals' as const,
        setSearchType: vi.fn(),
        onSearch: vi.fn(),
        isSearching: false,
    };

    it('renders headline, search form, and 3 metric stat cards', () => {
        render(<HeroSection {...mockProps} />);

        expect(screen.getByText(/Discover Muhammadiyah's/i)).toBeInTheDocument();
        expect(screen.getByText(/Scientific Excellence/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search for journals/i)).toBeInTheDocument();
        expect(screen.getByText('120')).toBeInTheDocument();
        expect(screen.getByText('4.500')).toBeInTheDocument();
        expect(screen.getByText('35')).toBeInTheDocument();
        expect(screen.getByText(/Total Journals/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Articles/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Universities/i)).toBeInTheDocument();
    });

    it('submits search form on button click', () => {
        render(<HeroSection {...mockProps} />);
        const submitBtn = screen.getByRole('button', { name: /Search/i });
        fireEvent.click(submitBtn);
        expect(mockProps.onSearch).toHaveBeenCalled();
    });
});
