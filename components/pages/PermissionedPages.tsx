"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission } from "@/lib/middle/permissions";
import { UserRole } from "@/lib/middle/roles";
import { Session } from "better-auth";
import { NAV_LINKS } from "@/lib/data/menu";
import { toast } from "sonner";

interface PermissionedPagesProps {
  session: Session;
  children: ReactNode;
}

/**
 * Recursively scan NAV_LINKS (and their children) for an entry
 * whose href exactly matches the given path.
 */
function findLinkByPath(
  links: typeof NAV_LINKS,
  path: string
): { permission?: string } | null {
  for (const link of links) {
    if (link.href === path) {
      return { permission: link.permission };
    }
    if (Array.isArray(link.children)) {
      const found = findLinkByPath(link?.children, path);
      if (found) return found;
    }
  }
  return null;
}

export default function PermissionedPages({
  session,
  children,
}: PermissionedPagesProps) {
  const router = useRouter();
  const pathname = usePathname() || "";

  // Always run useMemo (hook #1)
  const { permission: requiredPermission } = useMemo(() => {
    const found = findLinkByPath(NAV_LINKS, pathname);
    return found ?? { permission: undefined };
  }, [pathname]);

  const userRole = session?.user?.role as UserRole;

  // Always compute isAllowed (no hooks here)
  const isAllowed =
    requiredPermission === undefined
      ? true
      : hasPermission(userRole, requiredPermission);

  // Keep track of whether we've already shown the toast
  const [toastShown, setToastShown] = useState(false);

  // Show toast once and redirect once if not allowed
  useEffect(() => {
    if (!isAllowed && !toastShown) {
      router.replace("/dashboard");
      toast.error("You’re Not Permitted!");
      setToastShown(true);
    }
  }, [isAllowed, router, toastShown]);

  // Only render children if allowed
  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
