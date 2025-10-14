import ProfileData from "@/components/profile/ProfileData";
import { getServerSession } from "@/lib/better-auth-client-and-actions/authAction";
import { redirect } from "next/navigation";
import React from "react";

export default async function Profile() {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-n");
  }
  return (
    <>
      <ProfileData session={session} />
    </>
  );
}
