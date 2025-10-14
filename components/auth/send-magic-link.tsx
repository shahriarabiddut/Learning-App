"use client";
import React from "react";
import { authClient } from "@/lib/better-auth-client-and-actions/auth-client";
import EmailAuthForm from "@/components/auth/email-auth-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SendMagicLink = ({
  isSubmitting,
  isMagicLink,
  setIsMagicLink,
}: {
  isSubmitting: boolean;
  isMagicLink: boolean;
  setIsMagicLink: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleMagicLink = async (email: string) => {
    const { data, error } = await authClient.signIn.magicLink({
      email,
      callbackURL: "/dashboard",
    });

    return {
      error: error?.message,
      success: data ? "Magic link sent! Check your email!" : undefined,
    };
  };
  return (
    <>
      <div className="inline-flex h-fit">
        <Button
          variant={"linkBlue"}
          disabled={isSubmitting}
          type="button"
          onClick={() => setIsMagicLink(true)}
        >
          Send Magic Link
        </Button>
      </div>
      {isMagicLink && (
        <Dialog open={isMagicLink} onOpenChange={() => setIsMagicLink(false)}>
          <DialogTitle />
          <DialogContent>
            <DialogHeader>
              <EmailAuthForm
                onSubmit={handleMagicLink}
                buttonLabel="Send Magic Link"
                formTitle="Sign in with Magic Link"
                formDescription="Enter your email to receive a magic link for signing in."
                variant="default"
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SendMagicLink;
