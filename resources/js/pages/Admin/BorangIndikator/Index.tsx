import TemplateFormModal from "@/components/Admin/Templates/TemplateFormModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { AccreditationTemplate, PaginatedResponse } from "@/types/assessment";
import { Head, Link, router } from "@inertiajs/react";
import {
    Copy,
    Edit,
    FolderTree,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { useState } from "react";

interface Template extends AccreditationTemplate {
    categories_count?: number;
    sub_categories_count?: number;
    indicators_count?: number;
    essay_questions_count?: number;
    can_be_deleted?: boolean;
}

const emptyTemplates: PaginatedResponse<Template> = {
    data: [],
    links: [],
    current_page: 1,
    from: 0,
    last_page: 1,
    path: "",
    per_page: 0,
    to: 0,
    total: 0,
};

interface Props {
    templates: PaginatedResponse<Template>;
    filters: {
        search?: string;
        type?: string;
        is_active?: string;
    };
}

/**
 * Borang Indikator Index Page (Super Admin)
 *
 * @description Management of accreditation templates with hierarchical structure (Unsur → Sub Unsur → Indikator)
 * @route GET /admin/borang-indikator
 * @features CRUD templates, toggle active, clone templates, view hierarchy, search/filter by type & status
 */
export default function BorangIndikatorIndex({
    templates = emptyTemplates,
    filters = {},
}: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [typeFilter, setTypeFilter] = useState(filters.type || "");
    const [statusFilter, setStatusFilter] = useState(filters.is_active || "");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cloneDialog, setCloneDialog] = useState<Template | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<Template | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        setIsLoading(true);
        router.get(
            route("admin.borang-indikator.index"),
            {
                ...(search && { search }),
                ...(typeFilter && { type: typeFilter }),
                ...(statusFilter && { is_active: statusFilter }),
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const handleClearFilters = () => {
        setSearch("");
        setTypeFilter("");
        setStatusFilter("");
        setIsLoading(true);
        router.get(
            route("admin.borang-indikator.index"),
            {},
            {
                preserveState: false,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const handleToggleActive = (template: Template) => {
        router.post(
            route("admin.templates.toggle", template.id),
            {},
            {
                preserveScroll: true,
                onError: (errors) => {
                    console.error("Error toggling template:", errors);
                },
            }
        );
    };

    const handleClone = (template: Template) => {
        setCloneDialog(template);
    };

    const confirmClone = () => {
        if (!cloneDialog) return;
        const newName = `${cloneDialog.name} (Copy)`;
        router.post(
            route("admin.templates.clone", cloneDialog.id),
            { new_name: newName },
            {
                preserveScroll: true,
                onFinish: () => setCloneDialog(null),
            }
        );
    };

    const handleDelete = (template: Template) => {
        setDeleteDialog(template);
    };

    const confirmDelete = () => {
        if (!deleteDialog) return;
        router.delete(
            route("admin.templates.destroy", deleteDialog.id),
            {
                preserveScroll: true,
                onFinish: () => setDeleteDialog(null),
            }
        );
    };

    const breadcrumbs = [
        {
            title: "Dashboard",
            href: route("dashboard"),
        },
        {
            title: "Borang Indikator",
            href: route("admin.borang-indikator.index"),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Borang Indikator" />

            <div className="flex h-full flex-col space-y-4 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Borang & Templates Management
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Kelola template akreditasi dengan struktur hierarki
                            (Unsur → Sub Unsur → Indikator)
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Template
                    </Button>
                </div>

                {/* Search & Filters */}
                <div className="space-y-4">
                    <form onSubmit={handleSearch} className="space-y-3">
                        <div className="flex flex-col gap-3 md:flex-row">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari nama atau versi template..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Type Filter */}
                            <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Tipe Template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="akreditasi">
                                        Akreditasi
                                    </SelectItem>
                                    <SelectItem value="indeksasi">
                                        Indeksasi
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">
                                        Nonaktif
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Apply Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full md:w-auto"
                            >
                                {isLoading ? "Loading..." : "Terapkan"}
                            </Button>
                        </div>

                        {/* Clear Filters Button */}
                        {(search || typeFilter || statusFilter) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                disabled={isLoading}
                            >
                                Hapus Filter
                            </Button>
                        )}
                    </form>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Template</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Versi</TableHead>
                                <TableHead>Struktur</TableHead>
                                <TableHead>Tgl Efektif</TableHead>
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead className="text-right w-[180px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.data.length > 0 ? (
                                templates.data.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <p className="font-semibold">
                                                    {template.name}
                                                </p>
                                                {template.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {template.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {template.type || "N/A"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {template.version || "-"}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <div className="space-y-1">
                                                {template.categories_count !== undefined && (
                                                    <div>
                                                        <span className="font-semibold text-blue-600">
                                                            {template.categories_count}
                                                        </span>{" "}
                                                        Unsur
                                                    </div>
                                                )}
                                                {template.sub_categories_count !== undefined && (
                                                    <div>
                                                        <span className="font-semibold text-green-600">
                                                            {template.sub_categories_count}
                                                        </span>{" "}
                                                        Sub Unsur
                                                    </div>
                                                )}
                                                {template.indicators_count !== undefined && (
                                                    <div>
                                                        <span className="font-semibold text-purple-600">
                                                            {template.indicators_count}
                                                        </span>{" "}
                                                        Indikator
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {template.effective_date
                                                ? new Date(
                                                      template.effective_date
                                                  ).toLocaleDateString("id-ID", {
                                                      year: "numeric",
                                                      month: "short",
                                                      day: "numeric",
                                                  })
                                                : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={template.is_active ?? false}
                                                    onCheckedChange={() =>
                                                        handleToggleActive(template)
                                                    }
                                                    disabled={isLoading}
                                                    aria-label="Toggle active status"
                                                />
                                                <Badge
                                                    variant={
                                                        template.is_active
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className="whitespace-nowrap"
                                                >
                                                    {template.is_active
                                                        ? "Aktif"
                                                        : "Nonaktif"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    title="Kelola Struktur"
                                                >
                                                    <Link
                                                        href={route(
                                                            "admin.templates.structure",
                                                            template.id
                                                        )}
                                                    >
                                                        <FolderTree className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                More actions
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setEditingTemplate(
                                                                    template
                                                                )
                                                            }
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleClone(template)
                                                            }
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Clone
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(template)}
                                                            disabled={
                                                                !template.can_be_deleted
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FolderTree className="h-8 w-8 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    Template tidak ditemukan
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Mulai dengan membuat template baru
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {templates.links && templates.links.length > 3 && (
                    <Pagination>
                        <PaginationContent>
                            {templates.links.map((link, i: number) => {
                                if (!link.url && !link.label) return null;

                                // Helper function to decode HTML entities
                                const decodeHtml = (html: string) => {
                                    const txt = document.createElement("textarea");
                                    txt.innerHTML = html;
                                    return txt.value;
                                };

                                const label = decodeHtml(link.label);

                                return (
                                    <PaginationItem key={`${link.label}-${i}`}>
                                        {link.url ? (
                                            <PaginationLink
                                                href={link.url}
                                                isActive={link.active}
                                            >
                                                {label}
                                            </PaginationLink>
                                        ) : (
                                            <span className="px-4 py-2 text-sm text-muted-foreground">
                                                {label}
                                            </span>
                                        )}
                                    </PaginationItem>
                                );
                            })}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            {/* Create Modal */}
            <TemplateFormModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                mode="create"
            />

            {/* Edit Modal */}
            {editingTemplate && (
                <TemplateFormModal
                    open={!!editingTemplate}
                    onOpenChange={(open) => {
                        if (!open) setEditingTemplate(null);
                    }}
                    mode="edit"
                    template={editingTemplate}
                />
            )}

            {/* Clone Confirmation Dialog */}
            <AlertDialog open={!!cloneDialog} onOpenChange={(open) => !open && setCloneDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clone Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menduplikasi template{" "}
                            <strong>"{cloneDialog?.name}"</strong>?
                            <br />
                            <br />
                            Template baru akan diberi nama:{" "}
                            <strong>"{cloneDialog?.name} (Copy)"</strong>
                            <br />
                            <br />
                            Semua struktur (Unsur, Sub Unsur, dan Indikator) akan
                            disalin.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmClone}>
                            Clone Template
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus template{" "}
                            <strong>"{deleteDialog?.name}"</strong>?
                            <br />
                            <br />
                            <span className="text-red-600 font-semibold">
                                Tindakan ini tidak dapat dibatalkan.
                            </span>
                            {" "}Semua Unsur Evaluasi, Sub Unsur, dan Indikator yang
                            terkait akan ikut terhapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus Template
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
