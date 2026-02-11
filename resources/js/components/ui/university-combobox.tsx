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
 * - Displays "CODE - Name" format for clarity
 *
 * @author JurnalMU Team
 */

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type University = {
    id: number;
    name: string;
    code: string;
    short_name?: string;
};

interface UniversityComboboxProps {
    universities: University[];
    value: string; // Selected university ID as string
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    error?: string;
}

export function UniversityCombobox({
    universities,
    value,
    onValueChange,
    placeholder = 'Select university...',
    emptyText = 'No university found.',
    disabled = false,
    className,
    error,
}: UniversityComboboxProps) {
    const [open, setOpen] = React.useState(false);

    // Find selected university
    const selectedUniversity = universities.find((uni) => uni.id.toString() === value);

    // Format display text: "CODE - Name"
    const getDisplayText = (uni: University) => {
        return `${uni.code} - ${uni.short_name || uni.name}`;
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
                            'w-full justify-between',
                            !selectedUniversity && 'text-muted-foreground',
                            error && 'border-red-500',
                            className,
                        )}
                        disabled={disabled}
                    >
                        {selectedUniversity ? getDisplayText(selectedUniversity) : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search by name or code..." />
                        <CommandList>
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {universities.map((uni) => (
                                    <CommandItem
                                        key={uni.id}
                                        value={`${uni.code} ${uni.short_name} ${uni.name}`} // Search by all fields
                                        onSelect={() => {
                                            onValueChange(uni.id.toString());
                                            setOpen(false);
                                        }}
                                    >
                                        <Check className={cn('mr-2 h-4 w-4', value === uni.id.toString() ? 'opacity-100' : 'opacity-0')} />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{uni.code}</span>
                                            <span className="text-sm text-muted-foreground">{uni.short_name || uni.name}</span>
                                        </div>
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
