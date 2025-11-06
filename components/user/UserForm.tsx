"use client";
import { ImageInput } from "@/components/shared/Input/ImageInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { userRoles } from "@/lib/constants/env";
import {
  useAddUserMutation,
  useUpdateUserMutation,
} from "@/lib/redux-features/user/userApi";
import { UserFormProps } from "@/lib/types";
import {
  UserFormValues,
  userSchema,
  UserUpdateFormValues,
  userUpdateSchema,
} from "@/schemas/userSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SearchableSelect from "../shared/Input/SearchableSelect";
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";
import { UserRole, UserType } from "@/lib/middle/roles";

// Define userType options based on role
const getValidUserTypesForRole = (role: string, isSuperAdmin: boolean) => {
  switch (role) {
    case UserRole.ADMIN:
      return isSuperAdmin
        ? [
            { label: "User", value: UserType.USER },
            { label: "Super Admin", value: UserType.SUPER_ADMIN },
            { label: "Editor", value: UserType.EDITOR },
          ]
        : [
            { label: "User", value: UserType.USER },
            { label: "Editor", value: UserType.EDITOR },
          ];

    case UserRole.AUTHOR:
      return [
        { label: "Teacher", value: UserType.TEACHER },
        { label: "Programmer", value: UserType.PROGRAMMER },
        { label: "Engineer", value: UserType.ENGINEER },
        { label: "Developer", value: UserType.DEVELOPER },
        { label: "Designer", value: UserType.DESIGNER },
        { label: "Data Scientist", value: UserType.DATA_SCIENTIST },
        { label: "Technical Writer", value: UserType.TECHNICAL_WRITER },
        { label: "Architect", value: UserType.ARCHITECT },
      ];

    case UserRole.USER:
      return [
        { label: "Student", value: UserType.STUDENT },
        { label: "Commentator", value: UserType.COMMENTATOR },
        { label: "Reader", value: UserType.READER },
        { label: "Contributor", value: UserType.CONTRIBUTOR },
        { label: "Moderator", value: UserType.MODERATOR },
        { label: "Reviewer", value: UserType.REVIEWER },
      ];

    case UserRole.SUBSCRIBER:
      return [{ label: "User", value: UserType.USER }];

    default:
      return [{ label: "User", value: UserType.USER }];
  }
};

// Get default userType based on role
const getDefaultUserType = (role: string): UserType => {
  switch (role) {
    case UserRole.ADMIN:
      return UserType.USER;
    case UserRole.AUTHOR:
      return UserType.TEACHER;
    case UserRole.USER:
      return UserType.STUDENT;
    case UserRole.SUBSCRIBER:
      return UserType.USER;
    default:
      return UserType.USER;
  }
};

export const UserForm = ({ open, onOpenChange, user }: UserFormProps) => {
  const [addUser, { isLoading: loading }] = useAddUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [isSubmitting, setIsSubmitting] = useState(
    loading || updating || false
  );
  const isEditMode = Boolean(user);

  const form = useForm<UserFormValues | UserUpdateFormValues>({
    resolver: zodResolver(isEditMode ? userUpdateSchema : userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      userType: "student",
      password: "",
      isActive: false,
      emailVerified: false,
      image: "",
    },
  });

  // Watch the role field to conditionally show/hide userType
  const selectedRole = form.watch("role");
  const selectedUserType = form.watch("userType");
  const { data: session } = useSession();

  // Check if current user is superadmin
  const isSuperAdmin = useMemo(() => {
    return (
      session?.user?.role === "admin" &&
      session?.user?.userType === UserType.SUPER_ADMIN
    );
  }, [session]);

  // Get available userType options based on selected role
  const userTypeOptions = useMemo(() => {
    return getValidUserTypesForRole(selectedRole, isSuperAdmin);
  }, [selectedRole, isSuperAdmin]);

  // Update userType when role changes
  useEffect(() => {
    if (selectedRole) {
      const availableOptions = getValidUserTypesForRole(
        selectedRole,
        isSuperAdmin
      );
      const currentUserType = form.getValues("userType");

      // Check if current userType is valid for the new role
      const isValidUserType = availableOptions.some(
        (option) => option.value === currentUserType
      );

      // If not valid, set to default
      if (!isValidUserType) {
        const defaultUserType = getDefaultUserType(selectedRole);
        form.setValue("userType", defaultUserType);
      }
    }
  }, [selectedRole, isSuperAdmin, form]);

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          name: user.name || "",
          email: user.email || "",
          role: user.role || "user",
          userType: user.userType || "user",
          password: "",
          isActive: user.isActive || false,
          emailVerified: user.emailVerified || false,
          image: user.image || "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          role: "user",
          userType: "student",
          password: "",
          isActive: false,
          emailVerified: false,
          image: "",
        });
      }
    }
  }, [open, user, form]);

  const onSubmit = async (values: UserFormValues | UserUpdateFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...values,
        image: values.image,
      };

      if (user) {
        if (!payload.password || payload.password.trim() === "") {
          const { password, ...payloadWithoutPassword } = payload;
          await updateUser({
            id: user.id,
            ...payloadWithoutPassword,
          }).unwrap();
        } else {
          await updateUser({
            id: user.id,
            ...payload,
          }).unwrap();
        }
        toast.success("User updated successfully");
      } else {
        await addUser(payload).unwrap();
        toast.success("User created successfully");
      }

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Something went wrong!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        open ? "block" : "hidden"
      }`}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
              {user ? "Edit User" : "Add New User"}
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 2 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto p-6 flex-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter full name"
                            {...field}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            {...field}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem
                        className={`${user ? "hidden" : "flex flex-col"}`}
                      >
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password"
                            {...field}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role Field */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Role <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select role"
                            options={userRoles}
                            className="w-full h-auto bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* User Type Field - Controlled by Role */}
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          User Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select user type"
                            options={userTypeOptions}
                            className="w-full h-auto bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Available types depend on selected role
                        </p>
                      </FormItem>
                    )}
                  />

                  {/* Status Fields */}
                  <div className="grid grid-cols-2 gap-3 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border px-4 py-3 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Active Status
                            </FormLabel>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Enable user account
                            </p>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-5 w-5 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 cursor-pointer transition-all"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emailVerified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border px-4 py-3 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email Verified
                            </FormLabel>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Mark email as verified
                            </p>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-5 w-5 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 cursor-pointer transition-all"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Image Field - Using the new ImageInput component */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile Image
                      </FormLabel>
                      <ImageInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        currentImageUrl={user?.image}
                        showCurrentImage={!!user}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter image URL or upload an image
                      </p>
                    </FormItem>
                  )}
                />

                {/* Footer Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  >
                    {loading || isSubmitting
                      ? "Saving..."
                      : user
                      ? "Update User"
                      : "Create User"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
