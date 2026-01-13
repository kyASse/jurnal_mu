import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ROLE_NAMES } from '@/constants/roles';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Award, BookOpen, BookType, Box, ClipboardList, FileText, LayoutGrid, Library, LifeBuoy, UserCheck, Users } from 'lucide-react';
import AppLogo from './app-logo';

// Common navigation items shared across all roles
const commonNavItems: NavItem[] = [
    {
        title: 'Support',
        href: route('support'),
        icon: LifeBuoy,
    },
    {
        title: 'Resources',
        href: route('resources'),
        icon: Box,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { user } = auth;

    // Base items available to everyone
    const baseNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    // Role-specific items
    let roleNavItems: NavItem[] = [];

    if (!user.role) {
        // Fallback for users without assigned roles - show only common items
        roleNavItems = [...commonNavItems];
    } else if (user.role.name === ROLE_NAMES.SUPER_ADMIN) {
        roleNavItems = [
            {
                title: 'Data Master',
                href: route('admin.data-master.index'),
                icon: BookType,
            },
            {
                title: 'Borang Indikator',
                href: route('admin.borang-indikator.index'),
                icon: ClipboardList,
            },
            {
                title: 'User Management',
                href: '#',
                icon: Users,
                items: [
                    { title: 'Universities', href: route('admin.universities.index') },
                    { title: 'Admin Kampus', href: route('admin.admin-kampus.index') },
                ],
            },
            {
                title: 'Journals',
                href: route('admin.journals.index'),
                icon: Library,
            },
            ...commonNavItems,
        ];
    } else if (user.role.name === ROLE_NAMES.ADMIN_KAMPUS) {
        roleNavItems = [
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
                title: 'Reviewer',
                href: route('admin-kampus.reviewer.index'),
                icon: UserCheck,
            },
            {
                title: 'Pembinaan',
                href: route('admin-kampus.pembinaan.index'),
                icon: Award,
            },
            ...commonNavItems,
        ];
    } else if (user.role.name === ROLE_NAMES.USER) {
        roleNavItems = [
            {
                title: 'Profil',
                href: route('user.profil.index'),
                icon: UserCheck,
            },
            {
                title: 'Jurnal',
                href: route('user.jurnal.index'),
                icon: BookOpen,
            },
            {
                title: 'Assessments',
                href: route('user.assessments.index'),
                icon: FileText,
            },
            {
                title: 'Pembinaan',
                href: route('user.pembinaan.index'),
                icon: Award,
            },
            ...commonNavItems,
        ];
    } else {
        // Fallback for unrecognized roles - show only common items
        roleNavItems = [...commonNavItems];
    }

    const mainNavItems = [...baseNavItems, ...roleNavItems];

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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
