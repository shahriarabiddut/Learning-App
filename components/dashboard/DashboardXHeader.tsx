import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { UserNav } from "@/components/dashboard/UserNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function DashboardXHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
      <Link
        href="/"
        className="flex items-center  mt-1 gap-2 font-semibold ml-10 md:ml-0 "
        title="Go To Home"
      >
        {" "}
        <Button
          variant="outline"
          size="icon"
          className="bg-background shadow-md"
        >
          <HomeIcon className="h-6 w-6" />
        </Button>
        <span
          className="hidden md:inline-block md:max-w-[200px] lg:max-w-full truncate"
          title={SITE_DEFAULTS.siteName}
        >
          {SITE_DEFAULTS.siteName}
        </span>
      </Link>
      <div className="ml-auto flex items-center space-x-4">
        <DashboardSearch />
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
