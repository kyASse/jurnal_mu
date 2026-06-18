import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ROLE_NAMES } from '@/constants/roles';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    BookType,
    Box,
    Building2,
    CalendarDays,
    ClipboardList,
    LayoutGrid,
    Library,
    LifeBuoy,
    Newspaper,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

// Common navigation items shared across all roles
const commonNavItems: NavItem[] = [
    {
        title: 'Resources',
        href: route('resources'),
        icon: Box,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { user } = auth;

    // Helper to check if user has a role (by name)
    const hasRole = (roleName: string) => {
        if (user.role && user.role.name === roleName) return true;
        return user.roles && user.roles.some((r: { name: string }) => r.name === roleName);
    };

    const isSuperAdmin = hasRole(ROLE_NAMES.SUPER_ADMIN);
    const isAdminKampus = hasRole(ROLE_NAMES.ADMIN_KAMPUS);
    const isUser = hasRole(ROLE_NAMES.USER);
    const isReviewer = hasRole('Reviewer') || user.is_reviewer;

    // Base items available to everyone
    const baseNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    // Super Admin items
    const superAdminNavItems: NavItem[] = [
        {
            title: 'Data Master',
            href: route('admin.data-master.index'),
            icon: BookType,
        },
        {
            title: 'Borang Indikator',
            href: route('admin.borang-indikator.index'),
            icon: ClipboardList,
            items: [
                { title: 'Templates', href: route('admin.templates.index') },
                { title: 'List View', href: route('admin.borang-indikator.list') },
            ],
        },
        {
            title: 'Universities',
            href: route('admin.universities.index'),
            icon: Building2,
        },
        {
            title: 'User Management',
            href: '#',
            icon: Users,
            items: [
                { title: 'Admin Kampus', href: route('admin.admin-kampus.index') },
                { title: 'Pengelola Jurnal', href: route('admin.users.index') },
                { title: 'Reviewer', href: route('admin.reviewers.index') },
            ],
        },
        {
            title: 'Journals',
            href: route('admin.journals.index'),
            icon: Library,
        },
        {
            title: 'Pembinaan',
            href: route('admin.pembinaan.index'),
            icon: Award,
        },
        {
            title: 'Agendas & Events',
            href: route('admin.events.index'),
            icon: CalendarDays,
        },
        {
            title: 'Reviewer Assignment',
            href: route('dikti.assessments.index'),
            icon: UserCheck,
        },
        {
            title: 'Support Tickets',
            href: route('admin.tickets.index'),
            icon: LifeBuoy,
        },
        {
            title: 'News Management',
            href: route('admin.news.index'),
            icon: Newspaper,
        },
    ];

    // Admin Kampus items
    const adminKampusNavItems: NavItem[] = [
        {
            title: 'Profil Universitas',
            href: route('admin-kampus.university.edit'),
            icon: Building2,
        },
        {
            title: 'Pengelola Jurnal',
            href: route('admin-kampus.users.index'),
            icon: Users,
        },
        {
            title: 'Journals',
            href: route('admin-kampus.journals.index'),
            icon: Library,
        },
        {
            title: 'Agendas & Events',
            href: route('admin-kampus.events.index'),
            icon: CalendarDays,
        },
        {
            title: 'Pembinaan',
            href: '#',
            icon: Award,
            items: [
                { title: 'Akreditasi', href: route('admin-kampus.pembinaan.akreditasi') },
                { title: 'Indeksasi', href: route('admin-kampus.pembinaan.indeksasi') },
            ],
        },
        {
            title: 'Support Tickets',
            href: route('admin-kampus.tickets.index'),
            icon: LifeBuoy,
        },
    ];

    if (isReviewer) {
        adminKampusNavItems.push({
            title: 'Reviewer',
            href: route('admin-kampus.reviewer.index'),
            icon: UserCheck,
        });
    }

    // User items
    const userNavItems: NavItem[] = [
        {
            title: 'Profil',
            href: route('user.profil.index'),
            icon: UserCheck,
        },
        {
            title: 'Jurnal',
            href: route('user.journals.index'),
            icon: BookOpen,
        },
        {
            title: 'Pembinaan',
            href: '#',
            icon: Award,
            items: [
                { title: 'Akreditasi', href: route('user.pembinaan.akreditasi') },
                { title: 'Indeksasi', href: route('user.pembinaan.indeksasi') },
            ],
        },
        {
            title: 'Support Tickets',
            href: route('user.tickets.index'),
            icon: LifeBuoy,
        },
    ];

    // Reviewer items
    const reviewerNavItems: NavItem[] = [
        {
            title: 'Penugasan Reviewer',
            href: route('reviewer.assignments.index'),
            icon: UserCheck,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={baseNavItems} label="Platform" />

                {isSuperAdmin && <NavMain items={superAdminNavItems} label="Super Admin" />}

                {isAdminKampus && <NavMain items={adminKampusNavItems} label="LPPM Admin" />}

                {isUser && <NavMain items={userNavItems} label="Pengelola Jurnal" />}

                {isReviewer && <NavMain items={reviewerNavItems} label="Reviewer" />}

                <NavMain items={commonNavItems} label="Resources" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
