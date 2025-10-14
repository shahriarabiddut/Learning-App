import * as z from "zod";

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, {
    message: "Password is Required",
  }),
});

export const ResetPassSchema = z.object({
  password: z
    .string()
    .min(6, {
      message: "Minimum 6 Characters Required!",
    })
    .max(30, {
      message: "Maximum 30 Characters!",
    }),
});

export const SignUpSchema = z.object({
  email: z.string().email({
    message: "Email Is Required!",
  }),
  password: z
    .string()
    .min(6, {
      message: "Minimum 6 Characters Required!",
    })
    .max(30, {
      message: "Maximum 30 Characters!",
    }),
  name: z
    .string()
    .min(1, {
      message: "Name is Required!",
    })
    .max(30, {
      message: "Name must be at most 30 characters!",
    }),
});

export const UserSchema = z.object({
  name: z.string().min(1, "Name is required").max(30, {
    message: "Name must be at most 30 characters!",
  }),
  email: z
    .string()
    .min(6, "Email must be at least 6 characters")
    .email("Please enter a valid email")
    .toLowerCase(),
  password: z.string().min(6, "Password is required").max(30, {
    message: "Maximum 30 Characters!",
  }),
});

export const EmailSchema = z.object({
  email: z
    .string()
    .min(6, "Email must be at least 6 characters")
    .email("Please enter a valid email")
    .toLowerCase(),
});
export const PasswordSchema = z.object({
  password: z
    .string()
    .min(6, {
      message: "Minimum 6 Characters Required!",
    })
    .max(30, {
      message: "Maximum 30 Characters!",
    }),
});
export const OTPSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const UpdateUserSchema = z.object({
  image: z.string().url(),
  name: z
    .string()
    .min(1, {
      message: "Name is Required!",
    })
    .max(30, {
      message: "Name must be at most 30 characters!",
    }),
});

export const UpdateUserEmailSchema = z.object({
  newEmail: z
    .string()
    .min(6, "Email must be at least 6 characters")
    .email("Please enter a valid email")
    .toLowerCase(),
  callbackURL: z.string().default("/dashboard"),
});

export const UpdateUserPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, {
      message: "Minimum 6 Characters Required!",
    })
    .max(30, {
      message: "Maximum 30 Characters!",
    }),
  currentPassword: z
    .string()
    .min(6, {
      message: "Minimum 6 Characters Required!",
    })
    .max(30, {
      message: "Maximum 30 Characters!",
    }),
  revokeOtherSessions: z.boolean(),
});

export const Enable2FASchema = z.object({
  state: z.boolean(),
  password: z
    .string()
    .min(6, {
      message: "Minimum 6 Characters Required!",
    })
    .max(30, {
      message: "Maximum 30 Characters!",
    }),
});
