/**
 * UniversityCombobox Component
 *
 * @description
 * Searchable combobox for selecting universities from a large list (172+ items).
 * Provides better UX than standard dropdown with search/filter functionality.
 *
 * @features
 * - Real-time search by code, short_name, or full name
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Mobile-friendly with responsive design
 * - "No results" feedback
 * - Displays "Name (PTM Code)" format for better readability
 *
 * @author JurnalMU Team
 */

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type User = {
    id: number;
    name: string;
    email: string;
    university_id?: number;
};

interface UserComboboxProps {
    users: User[];
    value: string; // Selected user ID as string
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    error?: string;
}

export function UserCombobox({
    users,
    value,
    onValueChange,
    placeholder = 'Pilih user...',
    emptyText = 'User tidak ditemukan.',
    disabled = false,
    loading = false,
    className,
    error,
}: UserComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    // Performance-optimized filtering for large lists
    const filteredUsers = React.useMemo(() => {
        if (!searchQuery.trim()) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query),
        );
    }, [users, searchQuery]);

    // Find selected user
    const selectedUser = users.find((user) => user.id.toString() === value);

    // Format display text: "Name (Email)"
    const getDisplayText = (user: User) => {
        return `${user.name} (${user.email})`;
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            'w-full justify-between h-auto py-2',
                            !selectedUser && 'text-muted-foreground',
                            error && 'border-red-500',
                            className,
                        )}
                        disabled={disabled || loading}
                    >
                        <span className="text-left break-words overflow-hidden flex-1">
                            {loading ? 'Memuat data...' : selectedUser ? getDisplayText(selectedUser) : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder="Search by name or code..." value={searchQuery} onValueChange={setSearchQuery} />
                        <CommandList>
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {filteredUsers.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        value={user.id.toString() + ' ' + user.name + ' ' + user.email}
                                        onSelect={() => {
                                            onValueChange(user.id.toString());
                                            setSearchQuery('');
                                            setOpen(false);
                                        }}
                                    >
                                        <Check className={cn('mr-2 h-4 w-4', value === user.id.toString() ? 'opacity-100' : 'opacity-0')} />
                                        <span className="flex-1 truncate">
                                            {user.name} <span className="text-muted-foreground">({user.email})</span>
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
