import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import Index from '../Index';
import Show from '../Show';
import React from 'react';

// Setup mock route
beforeAll(() => {
    (globalThis as any).route = (name: string, params?: any) => `/route/${name}`;
});

// Mock @inertiajs/react
const mockGet = vi.fn();
vi.mock('@inertiajs/react', () => {
    return {
        Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
        Head: ({ title }: any) => <title>{title}</title>,
        router: {
            get: (url: string, data?: any, options?: any) => mockGet(url, data, options),
        },
        usePage: () => ({
            props: {
                auth: { user: null },
            },
        }),
    };
});

// Mock layouts
vi.mock('@/layouts/public-layout', () => ({
    default: ({ children }: any) => <div data-testid="public-layout">{children}</div>,
}));

// Mock Lucide icons to avoid rendering complexities
vi.mock('lucide-react', () => ({
    CalendarDays: () => <span>CalendarDays</span>,
    Search: () => <span>Search</span>,
    Newspaper: () => <span>Newspaper</span>,
    ArrowLeft: () => <span>ArrowLeft</span>,
    Eye: () => <span>Eye</span>,
    Link2: () => <span>Link2</span>,
    Share2: () => <span>Share2</span>,
    Facebook: () => <span>Facebook</span>,
    Twitter: () => <span>Twitter</span>,
    ChevronDown: () => <span>ChevronDown</span>,
    ChevronUp: () => <span>ChevronUp</span>,
    Check: () => <span>Check</span>,
}));

const mockNewsData = {
    data: [
        {
            id: 1,
            title: 'News Title 1',
            slug: 'news-title-1',
            subtitle: 'Subtitle 1',
            body: '<p>Body 1</p>',
            thumbnail: null,
            tags: ['Tag1'],
            views: 10,
            published_at: '2026-06-11T12:00:00Z',
            author: { id: 1, name: 'Author 1' },
        }
    ],
    current_page: 1,
    last_page: 2,
    next_page_url: 'http://localhost/news?page=2',
};

const mockNewsItem = {
    id: 1,
    title: 'News Title 1',
    slug: 'news-title-1',
    subtitle: 'Subtitle 1',
    body: '<p>Body 1</p>',
    image: null,
    tags: ['Tag1'],
    views: 10,
    published_at: '2026-06-11T12:00:00Z',
    author: { id: 1, name: 'Author 1' },
};

describe('News Index Page', () => {
    it('renders news items and loads more on button click using local state next_page_url', async () => {
        // Mock global fetch
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                props: {
                    news: {
                        data: [
                            {
                                id: 2,
                                title: 'News Title 2',
                                slug: 'news-title-2',
                                subtitle: 'Subtitle 2',
                                body: '<p>Body 2</p>',
                                thumbnail: null,
                                tags: ['Tag2'],
                                views: 5,
                                published_at: '2026-06-11T13:00:00Z',
                                author: { id: 1, name: 'Author 1' },
                            }
                        ],
                        current_page: 2,
                        last_page: 2,
                        next_page_url: null,
                    }
                }
            }),
        });
        globalThis.fetch = mockFetch;

        render(<Index news={mockNewsData} />);

        expect(screen.getByText('News Title 1')).toBeInTheDocument();
        const loadMoreBtn = screen.getByRole('button', { name: /Load More News/i });
        expect(loadMoreBtn).toBeInTheDocument();

        // Click Load More
        await act(async () => {
            fireEvent.click(loadMoreBtn);
        });

        expect(mockFetch).toHaveBeenCalled();
        // The fetch should construct the URL from next_page_url (which should be local state nextPageUrl)
        // Let's verify that local state nextPageUrl was updated to null and the button disappeared.
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /Load More News/i })).not.toBeInTheDocument();
        });
        expect(screen.getByText('News Title 2')).toBeInTheDocument();
    });
});

describe('News Show Page', () => {
    it('uses navigator.clipboard if available', async () => {
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: mockWriteText,
            },
            writable: true,
            configurable: true,
        });

        render(<Show news={mockNewsItem} />);
        const copyBtn = screen.getByTitle('Copy Link');
        
        await act(async () => {
            fireEvent.click(copyBtn);
        });

        expect(mockWriteText).toHaveBeenCalledWith(window.location.href);

        // Restore clipboard
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            writable: true,
            configurable: true,
        });
    });

    it('falls back to document.execCommand if navigator.clipboard is not available', async () => {
        // Delete navigator.clipboard temporarily
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            value: undefined,
            writable: true,
            configurable: true,
        });

        const mockExecCommand = vi.fn();
        document.execCommand = mockExecCommand;

        render(<Show news={mockNewsItem} />);
        const copyBtn = screen.getByTitle('Copy Link');

        await act(async () => {
            fireEvent.click(copyBtn);
        });

        expect(mockExecCommand).toHaveBeenCalledWith('copy');

        // Restore
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            writable: true,
            configurable: true,
        });
    });
});
