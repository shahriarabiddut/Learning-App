"use client";
import { ImageInput } from "@/components/shared/Input/ImageInput";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { SelectCategory } from "@/components/shared/Select/SelectCategory";
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useFetchCategoriesQuery,
} from "@/lib/redux-features/categories/categoriesApi";
import { ICategory } from "@/models/categories.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { categorySchema } from "@/schemas/categorySchema";

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
  const [loading, setLoading] = useState(false);
  const [addCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  // Fetch categories for parent selection - only when form is open
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useFetchCategoriesQuery(
      {
        page: 1,
        limit: 100,
      },
      {
        skip: !open, // Only fetch when form is open
        refetchOnMountOrArgChange: true,
      }
    );

  // Memoize categories list
  const categories = useMemo(() => {
    return categoriesData?.data || [];
  }, [categoriesData]);

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

  // Reset form when editing/adding - improved reset logic
  useEffect(() => {
    if (open) {
      const resetValues = {
        name: category?.name ?? "",
        description: category?.description ?? "",
        imageUrl: category?.imageUrl ?? "",
        parentCategory: category?.parentCategory?.toString() ?? "",
        isActive: category?.isActive ?? true,
        featured: category?.featured ?? false,
      };

      form.reset(resetValues);
    }
  }, [open, category, form]);

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    if (loading) return; // Prevent double submission

    setLoading(true);

    try {
      const parentId =
        values.parentCategory === "0000" || values.parentCategory === ""
          ? null
          : values.parentCategory;

      // Find parent category name for payload
      const parentCategoryName = parentId
        ? categories.find((dept) => dept.id === parentId)?.name ?? null
        : null;

      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        imageUrl: values.imageUrl?.trim() || "",
        isActive: values.isActive,
        featured: values.featured,
        parentCategory: parentId,
        parent: parentCategoryName,
      };

      if (category) {
        await updateCategory({ id: category.id, ...payload }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await addCategory(payload).unwrap();
        toast.success("Category created successfully");
      }

      onOpenChange(false);
      form.reset(); // Reset form after successful submission
    } catch (error: any) {
      console.error("Form submission error:", error);

      // Extract meaningful error message
      let errorMessage = "An error occurred";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open && !loading) {
      onOpenChange(false);
      // Small delay to allow animation
      setTimeout(() => form.reset(), 150);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-gray-300">
        <DialogHeader>
          <DialogTitle className="text-center py-2">
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Category name"
                      {...field}
                      disabled={loading}
                      className="bg-background text-foreground border-border"
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
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Category description"
                      {...field}
                      rows={3}
                      disabled={loading}
                      className="bg-background text-foreground border-border resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <ImageInput
                    value={field.value || ""}
                    onChange={field.onChange}
                    currentImageUrl={category?.imageUrl}
                    showCurrentImage={!!category}
                    placeholder="https://example.com/image.jpg"
                    disabled={loading}
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
                <SelectCategory
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loading || isCategoriesLoading}
                  filterdId={category?.id}
                  title="Parent Category"
                />
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border px-4 py-2 border-gray-300 dark:border-gray-600">
                  <FormLabel>Active Status</FormLabel>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={loading}
                      className="h-5 w-5 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
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
                <FormItem className="flex items-center justify-between rounded-md border px-4 py-2 border-gray-300 dark:border-gray-600">
                  <FormLabel>Featured Category</FormLabel>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={loading}
                      className="h-5 w-5 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? category
                    ? "Updating..."
                    : "Creating..."
                  : category
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
