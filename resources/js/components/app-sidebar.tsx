import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ROLE_NAMES } from '@/constants/roles';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Award, BookOpen, BookType, Box, ClipboardList, FileText, Folder, LayoutGrid, Library, LifeBuoy, UserCheck, Users } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

// Common navigation items shared across all roles
const commonNavItems: NavItem[] = [
    {
        title: 'Support',
        href: '#',
        icon: LifeBuoy,
    },
    {
        title: 'Resources',
        href: '#',
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

    if (user.role && user.role.name === ROLE_NAMES.SUPER_ADMIN) {
        roleNavItems = [
            {
                title: 'Data Master',
                href: '#',
                icon: BookType,
                items: [
                    { title: 'Bidang Ilmu', href: '#' },
                ]
            },
            {
                title: 'Borang Indikator',
                href: '#',
                icon: ClipboardList,
                items: [
                    { title: 'Unsur', href: '#' },
                    { title: 'Sub Unsur', href: '#' },
                    { title: 'Indikator', href: '#' },
                ]
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
            ...commonNavItems,
        ];
    } else if (user.role && user.role.name === ROLE_NAMES.ADMIN_KAMPUS) {
        roleNavItems = [
            {
                title: 'Pengelola Jurnal',
                href: route('admin-kampus.users.index'),
                icon: Users,
            },
            {
                title: 'List Jurnal',
                href: '#',
                icon: Library,
            },
            {
                title: 'Reviewer',
                href: '#',
                icon: UserCheck,
            },
            {
                title: 'Pembinaan',
                href: '#',
                icon: Award,
                items: [
                    { title: 'Akreditasi', href: '#' },
                    { title: 'Indeksasi', href: '#' },
                ]
            },
            ...commonNavItems,
        ];
    } else if (user.role && user.role.name === ROLE_NAMES.USER) {
        roleNavItems = [
            // Profil is usually in the user menu, but requested in sidebar
            {
                title: 'Profil',
                href: '#',
                icon: UserCheck, // Placeholder icon
            },
            {
                title: 'Jurnal',
                href: '#',
                icon: BookOpen,
            },
            {
                title: 'Assessments',
                href: route('user.assessments.index'),
                icon: FileText,
            },
            {
                title: 'Pembinaan',
                href: '#',
                icon: Award,
                items: [
                    { title: 'Akreditasi', href: '#' },
                    { title: 'Indeksasi', href: '#' },
                ]
            },
            ...commonNavItems,
        ];
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
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
