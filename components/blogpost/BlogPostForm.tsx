"use client";
import { ImageInput } from "@/components/shared/Input/ImageInput";
import SharedLoader from "@/components/shared/Loader/SharedLoader";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import SearchableSelect from "@/components/shared/Input/SearchableSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddBlogPostMutation,
  useGetBlogPostByIdQuery,
  useUpdateBlogPostMutation,
} from "@/lib/redux-features/blogPost/blogPostApi";
import { useFetchCategoriesQuery } from "@/lib/redux-features/categories/categoriesApi";
import { IBlogPost } from "@/models/blogPost.model";
import { blogPostSchema } from "@/schemas/blogPostSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface BlogPostFormProps {
  postId?: string;
  isFormOpen: boolean;
  handleFormClose: (open: boolean) => void;
  onComplete?: () => void;
}

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export function BlogPostForm({
  postId,
  isFormOpen,
  handleFormClose,
  onComplete,
}: BlogPostFormProps) {
  // RTK Query hooks
  const [addBlogPost] = useAddBlogPostMutation();
  const [updateBlogPost] = useUpdateBlogPostMutation();

  // Fetch categories using RTK Query
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useFetchCategoriesQuery({
    page: 1,
    limit: 100,
  });

  // Fetch post if editing
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
    isSuccess: postFetched,
  } = useGetBlogPostByIdQuery(postId!, {
    skip: !postId,
  });

  // Local state
  const [tagInput, setTagInput] = useState("");
  const [readingTime, setReadingTime] = useState([5]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      contentType: "html",
      categories: [],
      tags: [],
      featuredImage: "",
      status: "draft",
      isActive: false,
      isFeatured: false,
      allowComments: true,
      seo: {
        title: "",
        description: "",
        keywords: [],
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
      },
      readingTime: 5,
    },
  });

  // Handle post data when fetched successfully
  useEffect(() => {
    if (postFetched && post) {
      const data = post as IBlogPost;

      form.reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content || "",
        contentType: data.contentType || "html",
        categories: data.categories?.map((cat: any) => cat.id || cat) || [],
        tags: data.tags || [],
        featuredImage: data.featuredImage || "",
        status: data.status || "draft",
        isActive: data.isActive || false,
        isFeatured: data.isFeatured || false,
        allowComments: data.allowComments !== false,
        seo: {
          title: data.seo?.title || "",
          description: data.seo?.description || "",
          keywords: data.seo?.keywords || [],
          ogTitle: data.seo?.ogTitle || "",
          ogDescription: data.seo?.ogDescription || "",
          ogImage: data.seo?.ogImage || "",
        },
        readingTime: data.readingTime || 5,
      });

      setSelectedCategories(
        data.categories?.map((cat: any) => cat.id || cat) || []
      );
      setReadingTime([data.readingTime || 5]);
    }
  }, [postFetched, post, form]);

  // Handle errors
  useEffect(() => {
    if (categoriesError) {
      toast.error("Failed to fetch categories");
    }
  }, [categoriesError]);

  useEffect(() => {
    if (postError) {
      toast.error("Failed to fetch post details");
    }
  }, [postError]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: BlogPostFormValues) => {
    try {
      const payload = {
        ...data,
        categories: selectedCategories,
      };

      if (postId) {
        await updateBlogPost({ id: postId, ...payload }).unwrap();
        toast.success(`${post?.title ?? "Post"} updated successfully`);
      } else {
        await addBlogPost(payload).unwrap();
        toast.success("Post created successfully");
      }

      if (onComplete) onComplete();
      handleFormClose(false);
      form.reset();
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || "Something went wrong!";
      toast.error(errorMessage);
    }
  };

  // Handle tag addition
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !form.getValues("tags")?.includes(trimmedTag)) {
      const currentTags = form.getValues("tags") || [];
      form.setValue("tags", [...currentTags, trimmedTag]);
      setTagInput("");
    }
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Loading state
  const isLoading = categoriesLoading || (postId && postLoading);

  if (isLoading) {
    return <SharedLoader />;
  }

  // Get categories from RTK Query data
  const categories = categoriesData?.data || [];

  return (
    <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] lg:w-[90vw] xl:w-[85vw] min-w-[80vw] max-w-7xl max-h-[95vh] overflow-auto p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky h-full z-10 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-850 border-b border-gray-200 dark:border-gray-700 px-6 py-5">
          <DialogHeader className="space-y-2 relative">
            <div
              className="absolute top-0 right-0 cursor-pointer"
              onClick={() => {
                handleFormClose(false);
                form.reset();
              }}
            >
              <X className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {post ? `Edit Blog Post` : "Create New Blog Post"}
                </DialogTitle>
                {post && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mt-1">
                    {post.title}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto -mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 bg-gray-50 dark:bg-gray-900 p-6 sm:p-8"
            >
              {/* Basic Information Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="space-y-2 lg:col-span-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Post Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter post title"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-generate slug if not manually edited
                              if (!postId || !post?.slug) {
                                form.setValue(
                                  "slug",
                                  generateSlug(e.target.value)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          URL Slug <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="post-url-slug"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                          Used in the URL: /blog/{field.value || "your-slug"}
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectItem
                              value="draft"
                              className="focus:bg-gray-100 dark:focus:bg-gray-700"
                            >
                              Draft
                            </SelectItem>
                            <SelectItem
                              value="published"
                              className="focus:bg-gray-100 dark:focus:bg-gray-700"
                            >
                              Published
                            </SelectItem>
                            <SelectItem
                              value="archived"
                              className="focus:bg-gray-100 dark:focus:bg-gray-700"
                            >
                              Archived
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Excerpt */}
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Excerpt
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary of your post..."
                          className="min-h-[100px] bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                        This will be displayed in post previews and search
                        results
                      </FormDescription>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Status Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Visibility
                        </FormLabel>
                        <div className="h-12 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4">
                          <div className="flex items-center gap-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                              Active
                            </FormLabel>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Featured
                        </FormLabel>
                        <div className="h-12 flex items-center justify-center rounded-lg border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-4">
                          <div className="flex items-center gap-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium text-yellow-700 dark:text-yellow-300 cursor-pointer">
                              Featured Post
                            </FormLabel>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowComments"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Comments
                        </FormLabel>
                        <div className="h-12 flex items-center justify-center rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 px-4">
                          <div className="flex items-center gap-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium text-blue-700 dark:text-blue-300 cursor-pointer">
                              Allow Comments
                            </FormLabel>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Post Content
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormControl>
                        <div className="min-h-[400px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Media & Categories Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Media & Categories
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Featured Image
                        </FormLabel>
                        <ImageInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          currentImageUrl={post?.featuredImage}
                          showCurrentImage={!!post}
                          placeholder="https://example.com/image.jpg"
                        />
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Categories
                          </FormLabel>
                          <FormControl>
                            <SearchableSelect
                              value={selectedCategories[0] || ""}
                              onValueChange={(value) => {
                                if (
                                  value &&
                                  !selectedCategories.includes(value)
                                ) {
                                  const newCategories = [
                                    ...selectedCategories,
                                    value,
                                  ];
                                  setSelectedCategories(newCategories);
                                  field.onChange(newCategories);
                                }
                              }}
                              placeholder="Select categories"
                              options={categories}
                              className="w-full h-auto bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-2xl"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    {/* Selected Categories */}
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((categoryId) => {
                          const category = categories.find(
                            (c: any) => c.id === categoryId
                          );
                          return (
                            <Badge
                              key={categoryId}
                              variant="secondary"
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            >
                              {category?.name || categoryId}
                              <button
                                type="button"
                                onClick={() => {
                                  const newCategories =
                                    selectedCategories.filter(
                                      (id) => id !== categoryId
                                    );
                                  setSelectedCategories(newCategories);
                                  form.setValue("categories", newCategories);
                                }}
                                className="ml-2 hover:text-purple-900 dark:hover:text-purple-100"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="readingTime"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reading Time (minutes): {readingTime[0]}
                          </FormLabel>
                          <FormControl>
                            <Slider
                              className="bg-purple-100 dark:bg-purple-900/20"
                              min={1}
                              max={60}
                              step={1}
                              value={readingTime}
                              onValueChange={(value) => {
                                setReadingTime(value);
                                field.onChange(value[0]);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-3">
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add a tag..."
                      className="flex-1 h-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      variant="outline"
                      className="h-10 px-4"
                    >
                      Add
                    </Button>
                  </div>
                  {form.watch("tags")?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.watch("tags")?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    SEO Settings
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="seo.title"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          SEO Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SEO optimized title"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                          Recommended: 50-60 characters
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seo.ogTitle"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Social Media Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Title for social sharing"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seo.description"
                    render={({ field }) => (
                      <FormItem className="space-y-2 lg:col-span-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Meta Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description for search engines..."
                            className="min-h-[80px] bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                          Recommended: 150-160 characters
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seo.ogDescription"
                    render={({ field }) => (
                      <FormItem className="space-y-2 lg:col-span-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Social Media Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Description for social sharing..."
                            className="min-h-[80px] bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seo.ogImage"
                    render={({ field }) => (
                      <FormItem className="space-y-2 lg:col-span-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Social Media Image URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/og-image.jpg"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                          Recommended size: 1200x630px
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3 rounded-b-xl shadow-lg">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    handleFormClose(false);
                  }}
                  className="px-6 py-2 h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  disabled={form.formState.isSubmitting}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="px-8 py-2 h-11 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 dark:from-purple-600 dark:to-pink-700 dark:hover:from-purple-700 dark:hover:to-pink-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {postId ? "Updating Post..." : "Creating Post..."}
                    </>
                  ) : (
                    <>
                      {postId ? (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Update Post
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Create Post
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
