"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/better-auth-client-and-actions/auth-client";
import { Dispatch, SetStateAction } from "react";
import EmailAuthForm from "@/components/auth/email-auth-form";
import { Button } from "@/components/ui/button";

const ForgetPassword = ({
  isSubmitting,
  isForget,
  setIsForget,
}: {
  isSubmitting: boolean;
  isForget: boolean;
  setIsForget: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleForgetPassword = async (email: string) => {
    let success, error;
    await authClient.forgetPassword(
      {
        email,
        redirectTo: "/reset-password",
      },
      {
        onSuccess: async (context) => {
          success =
            "Reset Password Email Sent! If not found, Check Spams Also...";
        },
        onError: async (context) => {
          error = context.error.message;
        },
      }
    );
    return { success, error };
  };

  return (
    <>
      <div className="inline-flex h-fit">
        <Button
          variant={"linkBlue"}
          disabled={isSubmitting}
          onClick={() => setIsForget(true)}
          type="button"
        >
          Forget Password
        </Button>
      </div>
      {isForget && (
        <Dialog open={isForget} onOpenChange={() => setIsForget(false)}>
          <DialogTitle />
          <DialogContent>
            <DialogHeader>
              <EmailAuthForm
                onSubmit={handleForgetPassword}
                buttonLabel="Send Reset Email"
                formTitle="Forget Password?"
                formDescription="Enter your email to receive a password reset email."
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ForgetPassword;
