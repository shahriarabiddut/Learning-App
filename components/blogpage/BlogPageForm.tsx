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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddBlogPageMutation,
  useGetBlogPageByIdQuery,
  useUpdateBlogPageMutation,
} from "@/lib/redux-features/blogPage/blogPageApi";
import { IBlogPage } from "@/models/blogPage.model";
import { blogPageSchema } from "@/schemas/blogPageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Eye,
  EyeOff,
  Info,
  FileText,
  Image as ImageIcon,
  Search,
  Edit2,
  Lock,
  Plus,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  pageStatus,
  statusForAuthor,
  statusForAuthorWithRevision,
} from "@/lib/constants/env";
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";

interface BlogPageFormProps {
  pageId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type BlogPageFormValues = z.infer<typeof blogPageSchema>;

type SeoVisibility = {
  seo: boolean;
  social: boolean;
};

// Helper function to extract text from HTML
const extractTextFromHtml = (html: string, maxLength: number = 160): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || "";
  return text.slice(0, maxLength).trim();
};

// Helper function to calculate reading time based on word count
const calculateReadingTime = (html: string): number => {
  const text = extractTextFromHtml(html, Infinity);
  const words = text.split(/\s+/).filter(Boolean).length;
  // Average reading speed: 200 words per minute
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes); // Minimum 1 minute
};

// Load SEO settings from localStorage
const loadSeoSettings = (): SeoVisibility => {
  if (typeof window === "undefined") return { seo: false, social: false };
  try {
    const saved = localStorage.getItem("blogpage-seo-visibility");
    return saved ? JSON.parse(saved) : { seo: false, social: false };
  } catch {
    return { seo: false, social: false };
  }
};

// Save SEO settings to localStorage
const saveSeoSettings = (settings: SeoVisibility) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("blogpage-seo-visibility", JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save SEO settings:", e);
  }
};

export function BlogPageForm({
  pageId,
  open,
  onOpenChange,
  onComplete,
}: BlogPageFormProps) {
  // RTK Query hooks
  const [addBlogPage] = useAddBlogPageMutation();
  const [updateBlogPage] = useUpdateBlogPageMutation();

  const {
    data: page,
    isLoading: pageLoading,
    error: pageError,
    isSuccess: pageFetched,
  } = useGetBlogPageByIdQuery(pageId!, {
    skip: !pageId,
  });
  const { data: session } = useSession();
  const isAdmin = useMemo(() => {
    return session?.user?.role === "admin";
  }, [session]);
  // Local state
  const [tagInput, setTagInput] = useState("");
  const [readingTime, setReadingTime] = useState([5]);
  const [seoVisibility, setSeoVisibility] = useState<SeoVisibility>(
    loadSeoSettings()
  );
  const [isExcerptEditable, setIsExcerptEditable] = useState(false);
  const [isSlugEditable, setIsSlugEditable] = useState(false);
  const [userSetReadingTime, setUserSetReadingTime] = useState(false);

  const form = useForm<BlogPageFormValues>({
    resolver: zodResolver(blogPageSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      contentType: "html",
      tags: [],
      featuredImage: "",
      status: "draft",
      isActive: false,
      isFeatured: false,
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

  // Auto-generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }, []);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        contentType: "html",
        tags: [],
        featuredImage: "",
        status: "draft",
        isActive: false,
        isFeatured: false,
        seo: {
          title: "",
          description: "",
          keywords: [],
          ogTitle: "",
          ogDescription: "",
          ogImage: "",
        },
        readingTime: 5,
      });
      setReadingTime([5]);
      setTagInput("");
      setIsExcerptEditable(false);
      setIsSlugEditable(false);
      setUserSetReadingTime(false);
    }
  }, [open, form]);

  // Handle page data when fetched successfully (for editing)
  useEffect(() => {
    if (pageFetched && page && open && pageId) {
      const data = page as IBlogPage;

      setIsExcerptEditable(false);
      setIsSlugEditable(false);
      setUserSetReadingTime(true);

      form.reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content || "",
        contentType: data.contentType || "html",
        tags: data.tags || [],
        featuredImage: data.featuredImage || "",
        status: data.status || "draft",
        isActive: data.isActive || false,
        isFeatured: data.isFeatured || false,

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

      setReadingTime([data.readingTime || 5]);
    }
  }, [pageFetched, page, form, open, pageId]);

  useEffect(() => {
    if (pageError) {
      toast.error("Failed to fetch page details");
    }
  }, [pageError]);

  const onSubmit = async (data: BlogPageFormValues) => {
    try {
      const payload = {
        ...data,
      };

      if (pageId) {
        await updateBlogPage({ id: pageId, ...payload }).unwrap();
        toast.success(`${page?.title ?? "Page"} updated successfully`);
      } else {
        await addBlogPage(payload).unwrap();
        toast.success("Page created successfully");
      }

      if (onComplete) onComplete();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || "Something went wrong!";
      toast.error(errorMessage);
    }
  };

  // Handle tag addition
  const addTag = useCallback(() => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !form.getValues("tags")?.includes(trimmedTag)) {
      const currentTags = form.getValues("tags") || [];
      form.setValue("tags", [...currentTags, trimmedTag]);
      setTagInput("");
    }
  }, [tagInput, form]);

  // Handle tag removal
  const removeTag = useCallback(
    (tagToRemove: string) => {
      const currentTags = form.getValues("tags") || [];
      form.setValue(
        "tags",
        currentTags.filter((tag) => tag !== tagToRemove)
      );
    },
    [form]
  );

  // Toggle SEO visibility
  const toggleSeoVisibility = useCallback((type: "seo" | "social" | "both") => {
    setSeoVisibility((prev) => {
      let newVisibility: SeoVisibility;

      if (type === "both") {
        const allVisible = prev.seo && prev.social;
        newVisibility = { seo: !allVisible, social: !allVisible };
      } else if (type === "seo") {
        newVisibility = { ...prev, seo: !prev.seo };
      } else {
        newVisibility = { ...prev, social: !prev.social };
      }

      saveSeoSettings(newVisibility);
      return newVisibility;
    });
  }, []);

  // Auto-calculate reading time from content
  const handleContentChange = useCallback(
    (content: string) => {
      form.setValue("content", content);

      // Only auto-update if user hasn't manually set reading time
      if (!userSetReadingTime && !pageId) {
        const calculatedTime = calculateReadingTime(content);
        setReadingTime([calculatedTime]);
        form.setValue("readingTime", calculatedTime);
      }

      // Auto-fill other fields for new pages
      if (!pageId) {
        const extractedText = extractTextFromHtml(content, 160);
        form.setValue("seo.description", extractedText);
        form.setValue("seo.ogDescription", extractedText);
        form.setValue("excerpt", extractedText);
      }
    },
    [form, pageId, userSetReadingTime]
  );

  // Loading state
  const isLoading = pageId && pageLoading;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle></DialogTitle>
          <SharedLoader />
        </DialogContent>
      </Dialog>
    );
  }

  const showSeoSection = seoVisibility.seo || seoVisibility.social;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] lg:w-[95vw] min-w-[90vw] max-w-7xl max-h-[95vh] overflow-auto p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogTitle className="p-0"></DialogTitle>
        <div className="sticky top-0 -mt-4 z-10 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-850 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <DialogHeader className="space-y-2 relative">
            <div
              className="absolute top-0 right-0 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {pageId ? `Editing Blog Page` : "Create New Blog Page"}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 bg-gray-50 dark:bg-gray-900 px-1"
            >
              {/* Basic Information Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-sm">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Info className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Basic Information
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="space-y-2 lg:col-span-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Page Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter page title"
                            className="h-10 sm:h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (!pageId) {
                                form.setValue(
                                  "slug",
                                  generateSlug(e.target.value)
                                );
                                form.setValue("seo.title", e.target.value);
                                form.setValue("seo.ogTitle", e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormControl>
                          <div className="h-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <RichTextEditor
                              value={field.value || ""}
                              className="w-full"
                              onChange={handleContentChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Media & Tags Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <ImageIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Media & Keywords
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
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
                            onChange={(e) => {
                              field.onChange(e);
                              if (!pageId) {
                                form.setValue("seo.ogImage", e);
                              }
                            }}
                            currentImageUrl={
                              pageId && page ? page.featuredImage : undefined
                            }
                            showCurrentImage={!!pageId && !!page}
                            placeholder="https://example.com/image.jpg"
                          />
                          <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
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
                          <Plus className="w-4 h-4" />
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
                    {/* Slug with toggle */}
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Slug
                            </FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsSlugEditable(!isSlugEditable)}
                              className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {isSlugEditable ? (
                                <>
                                  <Lock className="w-3 h-3 mr-1" />
                                  Lock
                                </>
                              ) : (
                                <>
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit
                                </>
                              )}
                            </Button>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="page-url-slug"
                              className="h-10 sm:h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                              {...field}
                              readOnly={!isSlugEditable}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                        </FormItem>
                      )}
                    />
                    {/* Reading Time */}
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
                                setUserSetReadingTime(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                        </FormItem>
                      )}
                    />
                    {/* Excerpt with toggle */}
                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem className="space-y-2 col-span-1">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Excerpt
                            </FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setIsExcerptEditable(!isExcerptEditable)
                              }
                              className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {isExcerptEditable ? (
                                <>
                                  <Lock className="w-3 h-3 mr-1" />
                                  Lock
                                </>
                              ) : (
                                <>
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit
                                </>
                              )}
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Brief summary of your page..."
                              className="min-h-[100px] bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                              {...field}
                              readOnly={!isExcerptEditable}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* SEO Section Toggle Buttons */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant={
                      seoVisibility.seo && seoVisibility.social
                        ? "default"
                        : "outline"
                    }
                    onClick={() => toggleSeoVisibility("both")}
                    className="flex items-center gap-2"
                  >
                    {seoVisibility.seo && seoVisibility.social ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    Both Settings
                  </Button>
                  <Button
                    type="button"
                    variant={seoVisibility.seo ? "default" : "outline"}
                    onClick={() => toggleSeoVisibility("seo")}
                    className="flex items-center gap-2"
                  >
                    {seoVisibility.seo ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    SEO Settings
                  </Button>
                  <Button
                    type="button"
                    variant={seoVisibility.social ? "default" : "outline"}
                    onClick={() => toggleSeoVisibility("social")}
                    className="flex items-center gap-2"
                  >
                    {seoVisibility.social ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    Social Media Settings
                  </Button>
                </div>
              </div>

              {/* SEO Section - Conditionally Rendered */}
              {showSeoSection && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Search className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {seoVisibility.seo && seoVisibility.social
                        ? "SEO & Social Media Settings"
                        : seoVisibility.seo
                        ? "SEO Settings"
                        : "Social Media Settings"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* SEO Settings */}
                    {seoVisibility.seo && (
                      <>
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
                                  placeholder="SEO optimized title (50-60 characters)"
                                  className="h-10 sm:h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                {field.value?.length || 0}/60 characters
                              </FormDescription>
                              <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
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
                                {field.value?.length || 0}/160 characters
                                (Recommended: 150-160)
                              </FormDescription>
                              <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Social Media Settings */}
                    {seoVisibility.social && (
                      <>
                        <FormField
                          control={form.control}
                          name="seo.ogTitle"
                          render={({ field }) => (
                            <FormItem className="space-y-2 lg:col-span-2">
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Social Media Title
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Title for social sharing"
                                  className="h-10 sm:h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
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
                              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                {field.value?.length || 0}/160 characters
                              </FormDescription>
                              <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
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
                                  className="h-10 sm:h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                Recommended size: 1200x630px
                              </FormDescription>
                              <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 rounded-b-xl shadow-lg">
                {/* Status Toggles */}
                <div
                  className={`grid grid-cols-1 ${
                    isAdmin ? `lg:grid-cols-3` : `lg:grid-cols-1`
                  } gap-4`}
                >
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <SearchableSelect
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select Status"
                            size="md"
                            options={
                              isAdmin
                                ? pageStatus
                                : pageId && page && page?.status === "published"
                                ? pageStatus
                                : pageId
                                ? statusForAuthorWithRevision
                                : statusForAuthor
                            }
                            className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                      </FormItem>
                    )}
                  />
                  {isAdmin && (
                    <>
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="h-10 sm:h-12 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4">
                              <div className="flex items-center gap-3">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Visible
                                </FormLabel>
                              </div>
                            </div>
                            <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="h-10 sm:h-12 flex items-center justify-center rounded-lg border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-4">
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
                            <FormMessage className="text-xs text-red-600 dark:text-red-400 font-medium" />
                          </FormItem>
                        )}
                      />{" "}
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="px-6 py-2 h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto"
                  disabled={form.formState.isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="px-8 py-2 h-11 bg-gradient-to-r from-gray-500 to-teal-600 hover:from-gray-600 hover:to-teal-700 dark:from-gray-600 dark:to-teal-700 dark:hover:from-gray-700 dark:hover:to-teal-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
                      {pageId ? "Updating Page..." : "Creating Page..."}
                    </>
                  ) : (
                    <>
                      {pageId ? (
                        <>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Update Page
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Page
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
