import z from "zod";

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  role: z.string().default("user"),
  userType: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isActive: z.boolean().default(false),
  emailVerified: z.boolean().default(false),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
});
export const userUpdateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  role: z.string().default("user"),
  userType: z.string().optional(),
  password: z.string().optional(),
  isActive: z.boolean().default(false),
  emailVerified: z.boolean().default(false),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userSchema>;
export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
