"use client";
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
import { EmailSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import SharedMiniLoader from "@/components/shared/Loader/SharedMiniLoader";
import { Input } from "../ui/input";

type Email = z.infer<typeof EmailSchema>;

interface EmailAuthFormProps {
  onSubmit: (email: string) => Promise<{
    error?: string;
    success?: string;
  }>;
  buttonLabel: string;
  formTitle?: string;
  formDescription?: string;
  variant?: "default" | "linkBlue";
  isInModal?: boolean;
}

const EmailAuthForm = ({
  onSubmit,
  buttonLabel,
  formTitle,
  formDescription,
  variant = "default",
  isInModal = false,
}: EmailAuthFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<Email>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const handleSubmit = async (values: Email) => {
    setError("");
    setSuccess("");

    try {
      const result = await onSubmit(values.email);

      if (result?.error) {
        setError(result.error);
      }

      if (result?.success) {
        setSuccess(result.success);
        form.reset();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {formTitle && <h2 className="text-xl font-semibold">{formTitle}</h2>}
      {formDescription && (
        <p className="text-muted-foreground">{formDescription}</p>
      )}

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            e.preventDefault(); // Prevent default form submission
            form.handleSubmit(handleSubmit)(e);
          }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      type="email"
                      placeholder="user@email.com"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isInModal) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            variant={variant}
          >
            {isSubmitting ? <SharedMiniLoader /> : buttonLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EmailAuthForm;
