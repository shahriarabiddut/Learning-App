"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  authClient,
  useSession,
} from "@/lib/better-auth-client-and-actions/auth-client";
import { SUPPORT_EMAIL } from "@/lib/constants/env";
import { AlertCircle, FileWarningIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DisabledAccountPage() {
  const data = useSession();
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut();
    // console.log("Logged out");
    router.push("/"); // Redirect after sign out
  };
  if (data?.data?.user?.isActive) {
    router.push("/sign-in");
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <FileWarningIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Account Disabled
          </h1>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Your account has been disabled by the administrator. Please contact
            support if you believe this is an error.
          </p>

          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Need help?
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Contact our support team at{" "}
                    <a
                      href={`{mailto:${SUPPORT_EMAIL}}`}
                      className="underline hover:text-yellow-600 dark:hover:text-yellow-400"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
            type="button"
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
