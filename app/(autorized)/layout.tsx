import { DashboardChildren } from "@/components/dashboard/DashboardChildren";
import { DashboardXHeader } from "@/components/dashboard/DashboardXHeader";
import { DashboardXSidebar } from "@/components/dashboard/DashboardXSidebar";
import PermissionedPages from "@/components/pages/PermissionedPages";
import { getServerSession } from "@/lib/better-auth-client-and-actions/authAction";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";
import { redirect } from "next/navigation";
import type React from "react";

// Dynamic Metadata generation for SEO
export const metadata = generateMetadata({
  title: `Dashboard | ${SITE_DEFAULTS.siteName}`,
  description: `Access your simple dashboard on ${SITE_DEFAULTS.siteName} to view account details, manage your profile, and track basic activities easily.`,
  keywords: `dashboard, user dashboard, account management, profile, ${SITE_DEFAULTS.siteName}`,
  url: SITE_DEFAULTS.url + "/dashboard",
  image: SITE_DEFAULTS.siteLogo,
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }
  if (!session?.user?.isActive) {
    redirect("/disabled");
  }
  return (
    <>
      <main className="flex h-screen overflow-hidden bg-background text-foreground font-sans antialiased">
        <DashboardXSidebar session={session} />
        <section className="flex flex-1 flex-col overflow-hidden">
          <DashboardXHeader />
          <DashboardChildren>
            <PermissionedPages session={session}>{children}</PermissionedPages>{" "}
          </DashboardChildren>{" "}
          <footer className="border-t bg-muted/20">
            <div className="flex h-10 items-center justify-center">
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {SITE_DEFAULTS.siteName}
              </span>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}
