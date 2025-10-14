"use client";

import { TypographyP } from "@/components/shared/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Session } from "@/lib/better-auth/auth-types";
import { format } from "date-fns";

export default function ProfileData({ session }: { session: Session }) {
  const { user, session: userSession } = session;

  return (
    <div className="space-y-4 p-4 pt-6 md:p-8">
      <h1 className="text-2xl font-bold">User Data</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">User Info</CardTitle>
            <CardDescription>This is the whole user info!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <TypographyP>Id: {user.id}</TypographyP>
            <TypographyP>Name: {user.name}</TypographyP>
            <TypographyP>Email: {user.email}</TypographyP>
            <TypographyP>
              Role: <span className="uppercase">{user.role}</span>
            </TypographyP>
            <TypographyP>
              2FA: {user.twoFactorEnabled ? "Enabled" : "Disabled"}
            </TypographyP>
            <TypographyP>
              Joined at: {format(user.createdAt, "dd-MMM-yyyy")}
            </TypographyP>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Session Info</CardTitle>
            <CardDescription>This is the user session info!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <TypographyP>Id: {userSession.id}</TypographyP>
            <TypographyP>User IP: {userSession.ipAddress}</TypographyP>
            <TypographyP>Device: {userSession.userAgent}</TypographyP>
            <TypographyP>Token: {userSession.token}</TypographyP>
            <TypographyP>
              Login at: {format(userSession.updatedAt, "dd-MMM-yyyy")}
            </TypographyP>
            <TypographyP>
              Session expires at: {format(userSession.expiresAt, "dd-MMM-yyyy")}
            </TypographyP>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
