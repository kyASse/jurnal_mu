import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Create from '../Create';
import Edit from '../Edit';
import Index from '../Index';

// Setup mock route
beforeAll(() => {
    (globalThis as any).route = (name: string, params?: any) => `/route/${name}${params ? '/' + params : ''}`;
});

// Setup mock state for useForm
const mockPost = vi.fn();
const mockDelete = vi.fn();
const mockGet = vi.fn();

vi.mock('@inertiajs/react', () => {
    return {
        Link: ({ href, children, ...props }: any) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
        Head: ({ title }: any) => <title>{title}</title>,
        router: {
            get: (url: string, data?: any, options?: any) => mockGet(url, data, options),
            post: (url: string, data?: any, options?: any) => mockPost(url, data, options),
            delete: (url: string, options?: any) => mockDelete(url, options),
        },
        useForm: (initialValues: any) => {
            const [data, setDataState] = useState(initialValues);
            let transformer = (d: any) => d;

            const setData = vi.fn((keyOrData: any, value?: any) => {
                if (typeof keyOrData === 'string') {
                    setDataState((prev: any) => ({ ...prev, [keyOrData]: value }));
                } else if (typeof keyOrData === 'function') {
                    setDataState((prev: any) => keyOrData(prev));
                } else {
                    setDataState(keyOrData);
                }
            });

            const transform = vi.fn((callback: any) => {
                transformer = callback;
            });

            const post = vi.fn((url: string, options?: any) => {
                const finalData = transformer(data);
                if (options !== undefined) {
                    mockPost(url, finalData, options);
                } else {
                    mockPost(url, finalData);
                }
            });

            return {
                data,
                setData,
                transform,
                post,
                processing: false,
                errors: {},
            };
        },
    };
});

// Mock RichTextEditor for easy testing
vi.mock('@/components/RichTextEditor', () => ({
    default: ({ value, onChange, placeholder }: any) => (
        <textarea id="body" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    ),
}));

// Mock layouts
vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: any) => <div data-testid="app-layout">{children}</div>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    CalendarDays: () => <span>CalendarDays</span>,
    Search: () => <span>Search</span>,
    Newspaper: () => <span>Newspaper</span>,
    ArrowLeft: () => <span>ArrowLeft</span>,
    Plus: () => <span>Plus</span>,
    Trash2: () => <span>Trash2</span>,
    Edit2: () => <span>Edit2</span>,
    Save: () => <span>Save</span>,
    X: () => <span>X</span>,
    Bold: () => <span>Bold</span>,
    Italic: () => <span>Italic</span>,
    Underline: () => <span>Underline</span>,
    Strikethrough: () => <span>Strikethrough</span>,
    List: () => <span>List</span>,
    ListOrdered: () => <span>ListOrdered</span>,
    AlignLeft: () => <span>AlignLeft</span>,
    AlignCenter: () => <span>AlignCenter</span>,
    AlignRight: () => <span>AlignRight</span>,
    AlignJustify: () => <span>AlignJustify</span>,
    Link2: () => <span>Link2</span>,
    Eraser: () => <span>Eraser</span>,
    Code: () => <span>Code</span>,
    FileText: () => <span>FileText</span>,
}));

const mockNewsList = {
    data: [
        {
            id: 1,
            title: 'News Title Test 1',
            slug: 'news-title-test-1',
            views: 15,
            is_active: true,
            published_at: '2026-06-11T12:00:00Z',
        },
        {
            id: 2,
            title: 'News Title Test 2',
            slug: 'news-title-test-2',
            views: 5,
            is_active: false,
            published_at: null,
        },
    ],
    current_page: 1,
    last_page: 1,
    total: 2,
};

describe('Admin News Index Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders news items and handles search, toggle-active, and deletion', async () => {
        render(<Index news={mockNewsList} filters={{ search: '' }} />);

        expect(screen.getAllByText('News Management')[0]).toBeInTheDocument();
        expect(screen.getAllByText('News Title Test 1')[0]).toBeInTheDocument();
        expect(screen.getAllByText('News Title Test 2')[0]).toBeInTheDocument();
        expect(screen.getAllByText('15 views')[0]).toBeInTheDocument();
        expect(screen.getAllByText('5 views')[0]).toBeInTheDocument();

        // Search action
        const searchInput = screen.getByPlaceholderText('Search by news title...');
        fireEvent.change(searchInput, { target: { value: 'Test' } });
        const searchForm = searchInput.closest('form');
        expect(searchForm).toBeInTheDocument();
        fireEvent.submit(searchForm!);
        expect(mockGet).toHaveBeenCalledWith('/route/admin.news.index', { search: 'Test' }, expect.any(Object));

        // Toggle active status
        const activeBadges = screen.getAllByText('Active');
        fireEvent.click(activeBadges[0]);
        expect(mockPost).toHaveBeenCalledWith('/route/admin.news.toggle-active/1', {}, expect.any(Object));

        // Trigger delete confirm dialog
        const deleteButtons = screen.getAllByText('Trash2');
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText(/Are you sure you want to delete "News Title Test 1"/i)).toBeInTheDocument();

        const confirmDeleteBtn = screen.getByRole('button', { name: /Delete Article/i });
        fireEvent.click(confirmDeleteBtn);
        expect(mockDelete).toHaveBeenCalledWith('/route/admin.news.destroy/1', expect.any(Object));
    });
});

describe('Admin News Create Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all form fields, auto-generates slug, and submits form', async () => {
        render(<Create />);

        expect(screen.getByText('Create News Article')).toBeInTheDocument();

        const titleInput = screen.getByLabelText(/Title \*/i);
        const subtitleInput = screen.getByLabelText(/Subtitle/i);
        const bodyInput = screen.getByLabelText(/Body \*/i);
        const tagsInput = screen.getByLabelText(/Tags \(comma separated\)/i);
        const publishInput = screen.getByLabelText(/Publish Date\/Time/i);
        const activeCheckbox = screen.getByLabelText(/Publish Status \(Active\)/i);

        // Fill Title and trigger change which auto-generates slug internally
        fireEvent.change(titleInput, { target: { value: 'New Test Title!' } });

        // Fill other fields
        fireEvent.change(subtitleInput, { target: { value: 'Nice subtitle' } });
        fireEvent.change(bodyInput, { target: { value: '<p>Content</p>' } });
        fireEvent.change(tagsInput, { target: { value: 'Announcement, Event' } });
        fireEvent.change(publishInput, { target: { value: '2026-06-11T12:00' } });

        // Submit form
        const form = titleInput.closest('form')!;
        fireEvent.submit(form);

        expect(mockPost).toHaveBeenCalledWith(
            '/route/admin.news.store',
            expect.objectContaining({
                title: 'New Test Title!',
                slug: 'new-test-title',
                subtitle: 'Nice subtitle',
                body: '<p>Content</p>',
                tags: ['Announcement', 'Event'],
                is_active: true,
                published_at: '2026-06-11T12:00',
            }),
        );
    });
});

describe('Admin News Edit Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockNewsItem = {
        id: 5,
        title: 'Editing Title',
        slug: 'editing-title',
        subtitle: 'Sub editing',
        body: '<p>Body editing</p>',
        tags: ['Seminar', 'Updates'],
        is_active: false,
        published_at: '2026-06-11T14:30:00Z',
        thumbnail: 'news/thumbnails/thumb.jpg',
        image: 'news/images/main.jpg',
    };

    it('pre-populates existing data and submits put spoofer', () => {
        render(<Edit news={mockNewsItem} />);

        expect(screen.getByText('Edit News Article')).toBeInTheDocument();

        const titleInput = screen.getByLabelText(/Title \*/i);
        const subtitleInput = screen.getByLabelText(/Subtitle/i);
        const bodyInput = screen.getByLabelText(/Body \*/i);
        const tagsInput = screen.getByLabelText(/Tags \(comma separated\)/i);
        const activeCheckbox = screen.getByLabelText(/Publish Status \(Active\)/i) as HTMLInputElement;

        expect(titleInput).toHaveValue('Editing Title');
        expect(subtitleInput).toHaveValue('Sub editing');
        expect(bodyInput).toHaveValue('<p>Body editing</p>');
        expect(tagsInput).toHaveValue('Seminar, Updates');
        expect(activeCheckbox.checked).toBe(false);

        expect(screen.getByText('Current: news/thumbnails/thumb.jpg')).toBeInTheDocument();
        expect(screen.getByText('Current: news/images/main.jpg')).toBeInTheDocument();

        // Submit form
        const form = titleInput.closest('form')!;
        fireEvent.submit(form);

        expect(mockPost).toHaveBeenCalledWith(
            '/route/admin.news.update/5',
            expect.objectContaining({
                _method: 'PUT',
                title: 'Editing Title',
                slug: 'editing-title',
                subtitle: 'Sub editing',
                body: '<p>Body editing</p>',
                tags: ['Seminar', 'Updates'],
                is_active: false,
            }),
        );
    });
});
