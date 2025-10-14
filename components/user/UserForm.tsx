"use client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageInput } from "@/components/shared/ImageInput";

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
      store: "0",
      storeType: "",
      userType: "user",
      password: "",
      isActive: false,
      emailVerified: false,
      image: "",
    },
  });

  // Watch the role field to conditionally show/hide userType
  const selectedRole = form.watch("role");

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          name: user.name || "",
          email: user.email || "",
          role: user.role || "user",
          store: user.store || "0",
          storeType: user.storeType || "",
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
          store: "0",
          storeType: "",
          userType: "user",
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
      const { userType, ...restValues } = values;
      const role = values.role;
      const userTypeCheck =
        role === "user"
          ? ["user", "subscriber"].includes(userType)
            ? userType
            : "user"
          : role === "inventory"
          ? userType === "supplier"
            ? userType
            : "user"
          : "user";
      const payload = {
        ...restValues,
        userType: userTypeCheck,
        image: values.image,
      };

      // return 1;
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

  const isSuperAdmin = useSuperAdmin();

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
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full Name"
                            {...field}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="user@example.com"
                            {...field}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Password"
                            {...field}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
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
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="inventory">
                              Inventory User
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* User Type Field - Only shown when role is "user" */}
                  {(selectedRole === "user" ||
                    selectedRole === "inventory") && (
                    <FormField
                      control={form.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                              {selectedRole === "user" && (
                                <>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="subscriber">
                                    Subscriber
                                  </SelectItem>{" "}
                                </>
                              )}
                              {selectedRole === "inventory" && (
                                <>
                                  <SelectItem value="supplier">
                                    SUPPLIER
                                  </SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Store Fields - Only for Super Admin */}
                  {isSuperAdmin && (
                    <>
                      <FormField
                        control={form.control}
                        name="store"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Store ID"
                                {...field}
                                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="storeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store Type</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Store type"
                                {...field}
                                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Status Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border px-4 py-1 border-gray-300 dark:border-gray-600 h-12 md:h-10 mt-auto">
                          <div className="space-y-0.5">
                            <FormLabel>Active Status</FormLabel>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-5 w-5 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emailVerified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border px-4 py-1 border-gray-300 dark:border-gray-600 h-12 md:h-10 mt-auto">
                          <div className="space-y-0.5">
                            <FormLabel>Email Verified</FormLabel>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-5 w-5 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
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
                      <FormLabel>Image</FormLabel>
                      <ImageInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        currentImageUrl={user?.image}
                        showCurrentImage={!!user}
                        placeholder="https://example.com/image.jpg"
                      />
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
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="px-6 py-2"
                  >
                    {loading || isSubmitting
                      ? "Saving..."
                      : user
                      ? "Update"
                      : "Create"}
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
