"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  authClient,
  useSession,
} from "@/lib/better-auth-client-and-actions/auth-client";
import { Edit, LifeBuoy, LogOut, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { MdDashboard } from "react-icons/md";

export function UserNav({ dashboard = false }: { dashboard?: boolean }) {
  const { data } = useSession();
  const router = useRouter();

  const user = useMemo(() => data?.user, [data]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((word) => word[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join("");
  }, [user?.name]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-auto rounded-full pl-2 pr-3 hover:bg-accent/50 transition-colors "
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
              {user?.image && (
                <AvatarImage src={user?.image} alt={user?.name || "User"} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mt-3" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2 py-1">
            <p className="text-sm font-semibold leading-none text-foreground">
              {user?.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {dashboard && (
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="cursor-pointer flex items-center gap-3 py-2.5"
              >
                <MdDashboard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/profile"
              className="cursor-pointer flex items-center gap-3 py-2.5"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/profile/edit"
              className="cursor-pointer flex items-center gap-3 py-2.5"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Edit Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/help"
            className="cursor-pointer flex items-center gap-3 py-2.5"
          >
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            onClick={handleSignOut}
            className="w-full cursor-pointer flex items-center gap-3 py-2.5 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Log out</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
