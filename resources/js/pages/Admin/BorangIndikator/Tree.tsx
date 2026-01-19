
import CategoryFormModal from "@/components/Admin/Templates/CategoryFormModal";
import EssayQuestionFormModal from "@/components/Admin/Templates/EssayQuestionFormModal";
import IndicatorFormModal from "@/components/Admin/Templates/IndicatorFormModal";
import SubCategoryFormModal from "@/components/Admin/Templates/SubCategoryFormModal";
import {
    CategoryItem,
    EssayItem,
    IndicatorItem,
    SortableItem,
    SubCategoryItem,
} from "@/components/Admin/Templates/TreeItems";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import {
    AccreditationTemplate,
    EssayQuestion,
    EvaluationCategory,
    EvaluationIndicator,
    EvaluationSubCategory,
} from "@/types/assessment";
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Head, router } from "@inertiajs/react";
import { ArrowLeft, Plus, Layers3 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type IndicatorNode = {
    id: string;
    type: "indicator";
    data: EvaluationIndicator;
    children?: never;
};

type EssayNode = {
    id: string;
    type: "essay";
    data: EssayQuestion;
    children?: never;
};

type SubCategoryNode = {
    id: string;
    type: "sub_category";
    data: EvaluationSubCategory;
    children?: IndicatorNode[];
};

type CategoryNode = {
    id: string;
    type: "category";
    data: EvaluationCategory;
    children?: Array<SubCategoryNode | EssayNode>;
};

type TreeItem = CategoryNode | SubCategoryNode | IndicatorNode | EssayNode;

const isSubCategoryNode = (node: TreeItem): node is SubCategoryNode =>
    node.type === "sub_category";
const isEssayNode = (node: TreeItem): node is EssayNode => node.type === "essay";
const isIndicatorNode = (node: TreeItem): node is IndicatorNode => node.type === "indicator";

interface Props {
    template: AccreditationTemplate;
    structuredTree: CategoryNode[];
}

export default function TemplateTree({ template, structuredTree }: Props) {
    const [treeData, setTreeData] = useState<CategoryNode[]>(structuredTree);
    const [counts, setCounts] = useState({
        categoryCount: 0,
        subCategoryCount: 0,
        indicatorCount: 0,
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        route?: string;
        itemName?: string;
    }>({ open: false });

    // Modal States
    const [categoryModal, setCategoryModal] = useState<{
        open: boolean;
        item?: EvaluationCategory;
    }>({ open: false });
    const [subModal, setSubModal] = useState<{
        open: boolean;
        catId?: string;
        item?: EvaluationSubCategory;
    }>({ open: false });
    const [indicatorModal, setIndModal] = useState<{
        open: boolean;
        subId?: string;
        item?: EvaluationIndicator;
    }>({ open: false });
    const [essayModal, setEssayModal] = useState<{
        open: boolean;
        catId?: string;
        item?: EssayQuestion;
    }>({ open: false });

    const updateCounts = useCallback((data: TreeItem[]) => {
        let categoryCount = 0;
        let subCategoryCount = 0;
        let indicatorCount = 0;

        data.forEach((cat) => {
            categoryCount++;
            cat.children?.forEach((child) => {
                if (isSubCategoryNode(child)) {
                    subCategoryCount++;
                    indicatorCount += child.children?.filter(isIndicatorNode).length || 0;
                }
            });
        });

        setCounts({ categoryCount, subCategoryCount, indicatorCount });
    }, []);

    useEffect(() => {
        setTreeData(structuredTree);
        updateCounts(structuredTree);
    }, [structuredTree, updateCounts]);

    useEffect(() => {
        updateCounts(treeData);
    }, [treeData, updateCounts]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Helpers ---
    const getItemsIds = (items: TreeItem[]) => items.map((i) => i.id);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        // Determine hierarchy level based on ID prefix without being affected by hyphens in the rest of the ID
        const activeId = String(active.id);
        const type =
            activeId.startsWith("category-")
                ? "category"
                : activeId.startsWith("sub-")
                ? "sub"
                : activeId.startsWith("indicator-")
                ? "indicator"
                : activeId.startsWith("essay-")
                ? "essay"
                : "";

        // Optimistic Update & API Call
        let newTree = [...treeData];
        let moved = false;
        let routeName = "";
        let itemsToReorder: number[] = [];

        if (type === "category") {
            const oldIndex = treeData.findIndex((i) => i.id === active.id);
            const newIndex = treeData.findIndex((i) => i.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                newTree = arrayMove(treeData, oldIndex, newIndex);
                itemsToReorder = newTree.map((i) => i.data.id);
                routeName = "admin.categories.reorder";
                moved = true;
            }
        } else if (type === "sub") {
            // Find parent category of the sub-category
             for (const cat of newTree) {
                 const subs = cat.children?.filter(c => c.type === 'sub_category') || [];
                 const oldIndex = subs.findIndex(i => i.id === active.id);
                 const newIndex = subs.findIndex(i => i.id === over.id);
                 
                 if (oldIndex !== -1 && newIndex !== -1) {
                     const newSubs = arrayMove(subs, oldIndex, newIndex);
                     // Replace subs in children (keeping essays)
                     const essays = cat.children?.filter(c => c.type === 'essay') || [];
                     cat.children = [...newSubs, ...essays]; // Rebuild children using only sub_category and essay items; additional child types under a category (if introduced) are not handled here.
                     itemsToReorder = newSubs.map(i => i.data.id);
                     routeName = "admin.sub-categories.reorder";
                     moved = true;
                     break;
                 }
             }
        } else if (type === "essay") {
             // Find parent category
             for (const cat of newTree) {
                 const essays = cat.children?.filter(isEssayNode) || [];
                 const oldIndex = essays.findIndex(i => i.id === active.id);
                 const newIndex = essays.findIndex(i => i.id === over.id);
                 
                 if (oldIndex !== -1 && newIndex !== -1) {
                     const newEssays = arrayMove(essays, oldIndex, newIndex);
                     const subs = cat.children?.filter(isSubCategoryNode) || [];
                     cat.children = [...subs, ...newEssays];
                     itemsToReorder = newEssays.map(i => i.data.id);
                     routeName = "admin.essays.reorder";
                     moved = true;
                     break;
                 }
             }
        } else if (type === "indicator") {
             // Deep search for sub-category
             for (const cat of newTree) {
                  const subs = cat.children?.filter(isSubCategoryNode) || [];
                 for(const sub of subs) {
                      const indicators = sub.children || [];
                      const oldIndex = indicators.findIndex(i => i.id === active.id);
                      const newIndex = indicators.findIndex(i => i.id === over.id);

                      if(oldIndex !== -1 && newIndex !== -1) {
                           const newInds = arrayMove(indicators, oldIndex, newIndex);
                           sub.children = newInds;
                           itemsToReorder = newInds.map(i => i.data.id);
                           routeName = "admin.indicators.reorder";
                           moved = true;
                           break;
                      }
                 }
                 if(moved) break;
             }
        }

        if (moved) {
            setTreeData(newTree); // Optimistic

            // API Call
            if (routeName) {
                router.post(route(routeName), {
                    items: itemsToReorder.map((id) => ({ id: id, sort_order: 0 })), // Backend infers order from array index; sort_order is a placeholder field
                }, {
                    preserveScroll: true,
                    onSuccess: () => toast.success("Order updated"),
                    onError: () => {
                        toast.error("Failed to update order");
                        setTreeData(structuredTree); // Revert
                    },
                });
            }
        }
    };

    const handleDelete = (routeUrl: string, itemName: string) => {
        setDeleteDialog({ open: true, route: routeUrl, itemName });
    };

    const confirmDelete = () => {
        if (!deleteDialog.route) return;
        router.delete(deleteDialog.route, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Item deleted successfully");
                setDeleteDialog({ open: false });
            },
            onError: () => {
                toast.error("Failed to delete item");
            },
        });
    };

    const breadcrumbs = [
        { title: "Templates", href: route("admin.templates.index") },
        { title: template.name, href: route("admin.templates.show", template.id) },
        { title: "Structure", href: "#" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Structure - ${template.name}`} />

            <div className="flex h-full flex-col space-y-4 p-4 md:p-6 pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Template Structure
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Drag and drop to reorder. Configure categories, sub-categories, and indicators.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.visit(route('admin.templates.index'))}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => setCategoryModal({ open: true })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </div>
                </div>

                {/* Summary Counts */}
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Layers3 className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-foreground">Structure Summary:</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div>
                                <span className="font-semibold" style={{ color: 'var(--chart-1)' }}>{counts.categoryCount}</span>
                                <span className="text-muted-foreground ml-1">Unsur</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <div>
                                <span className="font-semibold" style={{ color: 'var(--chart-2)' }}>{counts.subCategoryCount}</span>
                                <span className="text-muted-foreground ml-1">Sub Unsur</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <div>
                                <span className="font-semibold" style={{ color: 'var(--chart-5)' }}>{counts.indicatorCount}</span>
                                <span className="text-muted-foreground ml-1">Indikator</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={getItemsIds(treeData)}
                        strategy={verticalListSortingStrategy}
                    >
                        {treeData.map((categoryNode) => {
                            const subCategories = categoryNode.children?.filter(isSubCategoryNode) || [];
                            const essayQuestions = categoryNode.children?.filter(isEssayNode) || [];

                            return (
                                <SortableItem key={categoryNode.id} id={categoryNode.id} className="flex flex-row items-start">
                                    <CategoryItem
                                        category={categoryNode.data}
                                        onEdit={() => setCategoryModal({ open: true, item: categoryNode.data })}
                                        onDelete={() => handleDelete(route('admin.categories.destroy', categoryNode.data.id), categoryNode.data.name)}
                                        onAddSubCategory={() => setSubModal({ open: true, catId: String(categoryNode.data.id) })}
                                        onAddEssay={() => setEssayModal({ open: true, catId: String(categoryNode.data.id) })}
                                    >
                                        <div className="pl-4 border-l-2 border-dashed border-gray-200 ml-1">
                                            {/* Sub Categories Context */}
                                            <SortableContext items={getItemsIds(subCategories)} strategy={verticalListSortingStrategy}>
                                                {subCategories.map(subNode => (
                                                    <SortableItem key={subNode.id} id={subNode.id} className="flex flex-row items-start mb-2">
                                                        <SubCategoryItem
                                                            subCategory={subNode.data}
                                                            onEdit={() => setSubModal({ open: true, catId: String(categoryNode.data.id), item: subNode.data })}
                                                            onDelete={() => handleDelete(route('admin.sub-categories.destroy', subNode.data.id), subNode.data.name)}
                                                            onAddIndicator={() => setIndModal({ open: true, subId: String(subNode.data.id) })}
                                                        >
                                                            {/* Indicators Context */}
                                                            <SortableContext items={getItemsIds(subNode.children || [])} strategy={verticalListSortingStrategy}>
                                                                <div className="grid gap-2">
                                                                    {subNode.children?.filter(isIndicatorNode).map(indNode => (
                                                                        <SortableItem key={indNode.id} id={indNode.id} className="flex flex-row items-center">
                                                                            <IndicatorItem 
                                                                                indicator={indNode.data}
                                                                                onEdit={() => setIndModal({ open: true, subId: String(subNode.data.id), item: indNode.data })}
                                                                                onDelete={() => handleDelete(route('admin.indicators.destroy', indNode.data.id), indNode.data.question)}
                                                                            />
                                                                        </SortableItem>
                                                                    ))}
                                                                </div>
                                                            </SortableContext>
                                                            {(!subNode.children || subNode.children.length === 0) && (
                                                                <div className="text-xs text-muted-foreground italic py-2">No indicators yet.</div>
                                                            )}
                                                        </SubCategoryItem>
                                                    </SortableItem>
                                                ))}
                                            </SortableContext>

                                            {/* Essays Context */}
                                             <SortableContext items={getItemsIds(essayQuestions)} strategy={verticalListSortingStrategy}>
                                                {essayQuestions.length > 0 && <div className="mt-4 mb-2 text-sm font-semibold text-blue-800">Essay Questions</div>}
                                                {essayQuestions.map(essayNode => (
                                                    <SortableItem key={essayNode.id} id={essayNode.id} className="flex flex-row items-start">
                                                        <EssayItem 
                                                            essay={essayNode.data}
                                                            onEdit={() => setEssayModal({ open: true, catId: String(categoryNode.data.id), item: essayNode.data })}
                                                            onDelete={() => handleDelete(route('admin.essays.destroy', essayNode.data.id), essayNode.data.question)}
                                                        />
                                                    </SortableItem>
                                                ))}
                                             </SortableContext>
                                        </div>
                                    </CategoryItem>
                                </SortableItem>
                            );
                        })}
                    </SortableContext>
                </DndContext>
                
                {treeData.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No categories defined yet.</p>
                        <Button onClick={() => setCategoryModal({ open: true })}>Add First Category</Button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CategoryFormModal 
                open={categoryModal.open} 
                onOpenChange={(v) => setCategoryModal({ ...categoryModal, open: v })}
                mode={categoryModal.item ? 'edit' : 'create'}
                category={categoryModal.item}
                templateId={String(template.id)}
            />
            {subModal.catId && (
                <SubCategoryFormModal
                    open={subModal.open}
                    onOpenChange={(v) => setSubModal({ ...subModal, open: v })}
                    mode={subModal.item ? 'edit' : 'create'}
                    subCategory={subModal.item}
                    categoryId={subModal.catId}
                />
            )}
            {indicatorModal.subId && (
                <IndicatorFormModal
                    open={indicatorModal.open}
                    onOpenChange={(v) => setIndModal({ ...indicatorModal, open: v })}
                    mode={indicatorModal.item ? 'edit' : 'create'}
                    indicator={indicatorModal.item}
                    subCategoryId={indicatorModal.subId}
                />
            )}
            {essayModal.catId && (
                <EssayQuestionFormModal
                    open={essayModal.open}
                    onOpenChange={(v) => setEssayModal({ ...essayModal, open: v })}
                    mode={essayModal.item ? 'edit' : 'create'}
                    essay={essayModal.item}
                    categoryId={essayModal.catId}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(v) => setDeleteDialog({ ...deleteDialog, open: v })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteDialog.itemName}"</span>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
