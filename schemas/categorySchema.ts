import z from "zod";
export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  parentCategory: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
