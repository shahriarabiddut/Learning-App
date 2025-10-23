import z from "zod";

export const seoSchema = z.object({
  title: z.string().max(150).optional(),
  description: z.string().max(300).optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogTitle: z.string().max(150).optional(),
  ogDescription: z.string().max(300).optional(),
  ogImage: z.string().url().nullable().optional(),
});

export const commentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  body: z.string().min(1, "Comment body is required"),
  approved: z.boolean().optional(),
  replies: z.lazy(() => z.array(commentSchema)).optional(),
});

export const contentBlockSchema = z.object({
  type: z.string().min(1, "Block type is required"),
  data: z.record(z.any()).optional(),
});

/* ---------- Main BlogPost Schema ---------- */

export const blogPostSchema = z.object({
  id: z.string().optional(),

  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  contentBlocks: z.array(contentBlockSchema).optional(),
  contentType: z.enum(["html", "markdown", "blocks"]).optional(),

  // author: z.string().min(1, "Author is required"),
  // authorName: z.string().optional(),

  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  featuredImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).default("draft"),

  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),

  seo: seoSchema.optional(),
  allowComments: z.boolean().optional(),
  comments: z.array(commentSchema).optional(),

  views: z.number().min(0).optional(),
  readingTime: z.number().min(0).optional(),

  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/* ---------- Type ---------- */
export type BlogPostFormValues = z.infer<typeof blogPostSchema>;
