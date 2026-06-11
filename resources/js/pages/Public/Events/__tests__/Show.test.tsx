import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import Show from '../Show';

beforeAll(() => {
    (globalThis as any).route = (name: string, params?: any) => `/route/${name}`;
});

vi.mock('@/layouts/public-layout', () => ({
    default: ({ children }: any) => <div data-testid="public-layout">{children}</div>,
}));

vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>ArrowLeft</span>,
    CalendarDays: () => <span>CalendarDays</span>,
    Clock: () => <span>Clock</span>,
    Copy: () => <span>Copy</span>,
    ExternalLink: () => <span>ExternalLink</span>,
    Globe: () => <span>Globe</span>,
    Link2: () => <span>Link2</span>,
    Mail: () => <span>Mail</span>,
    MapPin: () => <span>MapPin</span>,
    MessageCircle: () => <span>MessageCircle</span>,
    Phone: () => <span>Phone</span>,
    Share2: () => <span>Share2</span>,
    Twitter: () => <span>Twitter</span>,
    User: () => <span>User</span>,
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    Head: ({ title }: any) => <title>{title}</title>,
}));

const mockAgenda = {
    id: 1,
    title: 'Test Event Title',
    type: 'seminar',
    description: 'This is a test event description.',
    thumbnail_url: null,
    date_start: '2026-07-01',
    date_end: '2026-07-01',
    time_start: '09:00',
    time_end: '17:00',
    location_type: 'offline',
    location_venue: 'Main Hall',
    location_link: 'https://maps.google.com',
    registration_link: 'https://register.example.com',
    price: '0.00',
    contact_person_name: 'John Doe',
    contact_person_phone: '08123456789',
    contact_person_email: 'john@example.com',
    is_featured: true,
    university: {
        name: 'Test University',
        short_name: 'TU',
        logo_url: null,
        website_url: null,
    },
};

describe('Events Show Page', () => {
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

        render(<Show agenda={mockAgenda} />);
        const copyBtn = screen.getByRole('button', { name: /Copy Link/i });

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

        render(<Show agenda={mockAgenda} />);
        const copyBtn = screen.getByRole('button', { name: /Copy Link/i });

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

    it('updates button state to copied when clicked', async () => {
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: mockWriteText,
            },
            writable: true,
            configurable: true,
        });

        render(<Show agenda={mockAgenda} />);
        
        // Before click
        expect(screen.queryByText(/Copied!/i)).not.toBeInTheDocument();
        const copyBtn = screen.getByRole('button', { name: /Copy Link/i });

        await act(async () => {
            fireEvent.click(copyBtn);
        });

        // After click
        expect(screen.getByText(/Copied!/i)).toBeInTheDocument();

        // Restore clipboard
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            writable: true,
            configurable: true,
        });
    });
});
