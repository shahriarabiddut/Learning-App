"use client";
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";
import { useEffect, useState } from "react";
import SharedLoader from "@/components/shared/Loader/SharedLoader";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

export function DashboardContent() {
  const dataSession = useSession();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Wait until session loading completes
    if (dataSession.isPending === true) {
      return;
    }

    const role = dataSession.data?.user?.role || null;
    const id =
      dataSession.data?.user?.id || dataSession.data?.user?._id || null;

    setUserRole(role);
    setUserId(id);
    setLoading(false);
  }, [dataSession]);

  if (loading) {
    return <SharedLoader />;
  }

  // Render dashboard based on role
  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  return <UserDashboard userId={userId!} />;
}
