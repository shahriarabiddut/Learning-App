"use client";
import CardWrapper from "@/components/auth/card-wrapper";
import { FormError } from "@/components/forms/form-error";
import { FormSuccess } from "@/components/forms/form-success";
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
import { authClient } from "@/lib/better-auth-client-and-actions/auth-client";
import { SITE_NAME } from "@/lib/constants/env";
import { SignUpSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import SharedMiniLoader from "@/components/shared/Loader/SharedMiniLoader";

type SignUp = z.infer<typeof SignUpSchema>;

export default function SignUpForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const router = useRouter();
  const form = useForm<SignUp>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;
  const onSubmit = async (values: SignUp) => {
    setError("");
    setSuccess("");
    const { email, password, name } = values;

    const { data, error } = await authClient.signUp.email(
      {
        email: email,
        password: password,
        name: name,
        callbackURL: "/sign-in",
      },
      {
        onSuccess: async (context) => {
          setSuccess(
            "Account Created Successfully! Sending Verification Email....."
          );
          setTimeout(() => {
            router.push(`/email-verification?email=${email}`);
          }, 300);
        },
        onError: async (context) => {
          setError(context.error.message);
        },
      }
    );
  };
  return (
    <CardWrapper
      cardTitle={SITE_NAME}
      headerLabel="Create An Account"
      backButtonLabel="Already Have an account?&nbsp;"
      backButtonLinkLabel={" Login!"}
      backButtonHref="/sign-in"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name={"name"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      type="name"
                      placeholder="John Doe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"email"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      type="email"
                      placeholder="example@email.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"password"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      type="password"
                      placeholder="Enter Password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />
          <div>
            {!isSubmitting ? (
              <Button disabled={isSubmitting} type="submit" className="w-full ">
                Create An Account
              </Button>
            ) : (
              <>
                <SharedMiniLoader />
              </>
            )}
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
}
