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
import { Session } from "@/lib/better-auth/auth-types";
import { Enable2FASchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import SharedMiniLoader from "@/components/shared/Loader/SharedMiniLoader";
import { Switch } from "../ui/switch";

type Enable2FAForm = z.infer<typeof Enable2FASchema>;
export default function Enable2FA({ session }: { session: Session }) {
  const [twoFaData, setTwoFaData] = useState(session.user.twoFactorEnabled);
  //  skipVerificationOnEnable: true, as password is required or else make it false
  // 1. Define your form.
  const form = useForm<Enable2FAForm>({
    resolver: zodResolver(Enable2FASchema),
    defaultValues: {
      state: twoFaData || false,
      password: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;
  // 2. Define a submit handler.
  async function onSubmit(values: Enable2FAForm) {
    const { state, password } = values;
    if (state) {
      await authClient.twoFactor.enable(
        {
          password,
        },
        {
          onSuccess: () => {
            toast.success("Two Factor Authentication Enabled!");
            setTwoFaData(true);
          },
          onError: (ctx) => {
            toast.error("Something Went Wrong!");
            // alert("failed");
          },
        }
      );
    } else {
      await authClient.twoFactor.disable(
        {
          password,
        },
        {
          onSuccess: () => {
            toast.success("Two Factor Authentication Disabled!");
            setTwoFaData(false);
          },
          onError: (ctx) => {
            toast.error("Something Went Wrong!");
            // alert("failed");
          },
        }
      );
    }
  }
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Two Factor Authentication (
            <span
              className={`text-sm font-bold transition-all ${
                twoFaData ? "text-green-600" : "text-red-600"
              }`}
            >
              {twoFaData ? "Enabled" : "Disabled"}
            </span>
            )
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enable 2FA</FormLabel>
                      <FormDescription>
                        Enhance your account security by enabling Two-Factor
                        Authentication.
                      </FormDescription>
                    </div>

                    {/* ShadCN Switch */}
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-readonly={false}
                        />
                      </FormControl>
                    </div>
                    {/* Custom Switch */}
                    {/* <div
                      onClick={() => field.onChange(!field.value)}
                      className={`relative inline-flex h-9 w-30 items-center rounded-full transition-colors duration-300 cursor-pointer 
    ${field.value ? "bg-green-500" : "bg-red-500"}`}
                    >
                      <span
                        className={`absolute text-center w-full text-white text-sm font-semibold ${
                          field.value ? "left-5 " : "right-5 "
                        }`}
                      >
                        {field.value ? "Enabled" : "Disabled"}
                      </span>
                      <span
                        className={`absolute h-7 w-7 bg-white rounded-full shadow-md transition-transform duration-300 ${
                          field.value
                            ? "translate-x-[30%]"
                            : "translate-x-[300%]"
                        }`}
                      />
                    </div> */}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter Password To Confirm</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isSubmitting}
                        placeholder="Enter Your Account Password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is what you used to login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isSubmitting ? (
                <Button type="submit">
                  {/* {session.user.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"} */}
                  Submit Changes
                </Button>
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
