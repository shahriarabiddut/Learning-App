"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { authClient } from "@/lib/better-auth-client-and-actions/auth-client";
import { SessionUser } from "@/lib/types";
import { UpdateUserPasswordSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import SharedMiniLoader from "@/components/shared/Loader/SharedMiniLoader";

type UpdatePassword = z.infer<typeof UpdateUserPasswordSchema>;

export default function UpdatePasswordForm({ user }: { user: SessionUser }) {
  // 1. Define your form.
  const form = useForm<UpdatePassword>({
    resolver: zodResolver(UpdateUserPasswordSchema),
    defaultValues: {
      newPassword: "",
      currentPassword: "",
      revokeOtherSessions: true,
    },
  });
  const {
    formState: { isSubmitting },
  } = form;
  // 2. Define a submit handler.
  async function onSubmit(values: UpdatePassword) {
    try {
      await authClient.changePassword(values, {
        onSuccess: () => {
          toast.success("Password Changed , Successfully!");
          form.reset();
          // alert("success");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          // alert("failed");
        },
      });
    } catch (error) {
      toast.error("Something Went Wrong!");
    }
  }
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Change User Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isSubmitting}
                        placeholder="Enter Your New Password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This New Password you will use to login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isSubmitting}
                        placeholder="Enter Your Current Password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is you used to login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isSubmitting ? (
                <Button type="submit">Change Password</Button>
              ) : (
                <SharedMiniLoader />
              )}
            </form>
          </Form>{" "}
        </CardContent>
      </Card>
    </>
  );
}
