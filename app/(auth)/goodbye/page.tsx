"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GoodbyePage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl bg-white p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Goodbye! 👋
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            Your account has been successfully deleted. We're sad to see you go.
          </p>
          <p className="text-sm text-gray-500">
            If you change your mind, you can always come back and{" "}
            <Link
              href={"/sign-up"}
              className="font-semibold text-blue-900 hover:text-blue-800"
            >
              {" "}
              Create a new account!
            </Link>
            .
          </p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4 w-full"
            variant="secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
