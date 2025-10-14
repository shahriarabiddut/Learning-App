"use client";

import CardWrapper from "@/components/auth/card-wrapper";
import { TypographyP } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/better-auth-client-and-actions/auth-client";
import { SITE_NAME } from "@/lib/constants/env";
import { toast } from "sonner";

export default function SendVerificationEmail({ email }: { email: string }) {
  return (
    <CardWrapper
      cardTitle={SITE_NAME}
      headerLabel="Welcome New Member"
      backButtonLabel="hide"
      backButtonLinkLabel={"hide"}
      backButtonHref="hide"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg ">Verify Email</CardTitle>
        </CardHeader>
        <CardContent>
          <TypographyP>
            We’ve just sent a verification email to the address you provided.
            Please check your inbox (and don’t forget to look in your spam
            folder just in case). If you didn’t receive the email then{" "}
          </TypographyP>
          <Button className="mt-5 mx-auto w-full" variant={"outlineBlue"}>
            <span
              className=" cursor-pointer"
              onClick={async () => {
                try {
                  await authClient.sendVerificationEmail(
                    {
                      email,
                      callbackURL: "/dashboard",
                    },
                    {
                      onSuccess: () => {
                        toast.success("Check , Verification Email is Sent!");
                      },
                      onError: (ctx) => {
                        toast.error("Something Went Wrong!");
                      },
                    }
                  );
                } catch (error) {
                  toast.error("Something Went Wrong!");
                }
              }}
            >
              Request Again
            </span>
          </Button>
        </CardContent>
      </Card>
    </CardWrapper>
  );
}
