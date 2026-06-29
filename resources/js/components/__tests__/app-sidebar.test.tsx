import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock route function globally before module evaluation
(globalThis as any).route = (name: string, params?: any) => `/route/${name}/${params || ''}`;

// Mock dependencies
vi.mock('@inertiajs/react', () => {
    return {
        Link: ({ href, children, ...props }: any) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
        usePage: vi.fn(),
    };
});

vi.mock('@/components/nav-main', () => ({
    NavMain: ({ items }: any) => (
        <div data-testid="nav-main">
            {items.map((item: any) => (
                <div key={item.title} data-testid="nav-item">
                    {item.title}
                </div>
            ))}
        </div>
    ),
}));

vi.mock('@/components/nav-user', () => ({
    NavUser: () => <div data-testid="nav-user" />,
}));

vi.mock('@/components/ui/sidebar', () => ({
    Sidebar: ({ children }: any) => <div>{children}</div>,
    SidebarContent: ({ children }: any) => <div>{children}</div>,
    SidebarFooter: ({ children }: any) => <div>{children}</div>,
    SidebarHeader: ({ children }: any) => <div>{children}</div>,
    SidebarMenu: ({ children }: any) => <div>{children}</div>,
    SidebarMenuButton: ({ children }: any) => <div>{children}</div>,
    SidebarMenuItem: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('./app-logo', () => ({
    default: () => <div data-testid="app-logo" />,
}));

import { ROLE_NAMES } from '@/constants/roles';
import { usePage } from '@inertiajs/react';

describe('AppSidebar', () => {
    it('renders News Management for Super Admin', async () => {
        const { AppSidebar } = await import('../app-sidebar');

        vi.mocked(usePage).mockReturnValue({
            props: {
                auth: {
                    user: {
                        id: 1,
                        name: 'Super Admin',
                        role: {
                            name: ROLE_NAMES.SUPER_ADMIN,
                        },
                    },
                },
            },
        } as any);

        render(<AppSidebar />);
        expect(screen.getByText('News Management')).toBeInTheDocument();
        expect(screen.getByText('Announcements')).toBeInTheDocument();
    });
});
