import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { UserNav } from "@/components/dashboard/UserNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function DashboardXHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 shadow-sm">
      <Link
        href="/"
        className="flex items-center gap-3 font-semibold ml-10 md:ml-0 group"
        title="Go To Home"
      >
        <Button
          variant="outline"
          size="icon"
          className="bg-background shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105"
        >
          <HomeIcon className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
        </Button>
        <span
          className="hidden md:inline-block md:max-w-[200px] lg:max-w-full truncate text-foreground/90 group-hover:text-foreground transition-colors"
          title={SITE_DEFAULTS.title}
        >
          {SITE_DEFAULTS.title}
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <DashboardSearch />
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        <UserNav />
      </div>
    </header>
  );
}
