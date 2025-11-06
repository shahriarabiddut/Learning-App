"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddCategoryMutation,
  useFetchCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/lib/redux-features/categories/categoriesApi";
import { ICategory } from "@/models/categories.model";
import { categorySchema } from "@/schemas/categorySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Save, Star, Tag, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import ImageInput from "../shared/Input/ImageInput";
import SearchableSelect from "../shared/Input/SearchableSelect";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ICategory | null;
}

export const CategoryForm = ({
  open,
  onOpenChange,
  category,
}: CategoryFormProps) => {
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const { data: categoriesData, isLoading: isFetchingCategories } =
    useFetchCategoriesQuery({ limit: 50, page: 1 }, { skip: !open });

  const isLoading = isAdding || isUpdating;
  const isEditMode = Boolean(category);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      parentCategory: "",
      isActive: true,
      featured: false,
    },
  });

  // Reset form when editing/adding
  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        description: category?.description ?? "",
        imageUrl: category?.imageUrl ?? "",
        parentCategory: category?.parentCategory?.toString() ?? "",
        isActive: category?.isActive ?? true,
        featured: category?.featured ?? false,
      });
    }
  }, [open, category, form]);

  // Prepare parent category options (exclude current category to prevent circular reference)
  const parentOptions = (categoriesData?.data || [])
    .filter((cat) => cat.id !== category?.id)
    .map((cat) => ({
      value: cat.id,
      label: cat.name,
      description:
        cat.description?.substring(0, 50) +
        (cat.description?.length > 50 ? "..." : ""),
    }));

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    try {
      const parentId =
        values.parentCategory === "0" || values.parentCategory === ""
          ? null
          : values.parentCategory;

      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        imageUrl: values.imageUrl?.trim() || "",
        isActive: values.isActive,
        featured: values.featured,
        parentCategory: parentId,
        parent: parentId
          ? categoriesData?.data?.find((cat) => cat.id === parentId)?.name ??
            null
          : null,
      };

      if (isEditMode) {
        await updateCategory({
          id: category!.id,
          ...payload,
        }).unwrap();
        toast.success("Category updated successfully! 🎉");
      } else {
        await addCategory(payload).unwrap();
        toast.success("Category created successfully! 🎉");
      }

      onOpenChange(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
      toast.error(
        `Failed to ${
          isEditMode ? "update" : "create"
        } category: ${errorMessage}`
      );
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Watch form values for preview
  const watchedValues = form.watch();
  const hasUnsavedChanges = form.formState.isDirty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-11/12 min-w-[65vw] md:min-w-[60vw] max-h-[95vh] overflow-hidden flex flex-col dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="h-4 w-4 text-primary" />
            </div>
            {isEditMode ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          Category Name
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Electronics, Fashion, Books..."
                            {...field}
                            className="bg-background text-foreground border-border focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this category includes..."
                            {...field}
                            rows={3}
                            className="bg-background text-foreground border-border focus:ring-2 focus:ring-primary/20 resize-none"
                          />
                        </FormControl>
                        <FormDescription>
                          Help users understand what belongs in this category
                          and Good For Search Engines to understand what is this
                          about.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Visual & Organization Section */}
              <div className="space-y-4">
                {/* Image */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Image</FormLabel>
                      <ImageInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        currentImageUrl={category?.imageUrl}
                        showCurrentImage={Boolean(category)}
                        placeholder="https://example.com/image.jpg"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parent Category */}
                <FormField
                  control={form.control}
                  name="parentCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={
                            isFetchingCategories
                              ? "Loading categories..."
                              : "Select a parent category (optional)"
                          }
                          options={parentOptions}
                          className="w-full"
                          disabled={isFetchingCategories}
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a parent category to create a hierarchy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Settings Section */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Active Status */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">
                            Active Status
                          </FormLabel>
                          <FormDescription className="text-sm">
                            Users can see and browse this category
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? true}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Featured */}
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            Featured Category
                            <Star className="h-4 w-4 text-yellow-500" />
                          </FormLabel>
                          <FormDescription className="text-sm">
                            Highlight in featured sections
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Error Alert */}
              {Object.keys(form.formState.errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please fix the errors above before submitting.
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {isEditMode ? "Editing existing category" : "Creating new category"}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
              onClick={form.handleSubmit(onSubmit)}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Category"
                : "Create Category"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
