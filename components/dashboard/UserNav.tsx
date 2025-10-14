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
import { Edit, LifeBuoy, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdDashboard } from "react-icons/md";

export function UserNav({ dashboard = false }: { dashboard?: boolean }) {
  const { data } = useSession();
  const [user, setUser] = useState(null);
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/"); // Redirect after sign out
  };
  // console.log(data);
  useEffect(() => {
    setUser(data?.user);
  }, [data]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image} alt="@user" />
            <AvatarFallback>
              {!user?.image &&
                user?.name
                  .split(" ")
                  .map((word) => word[0].toUpperCase())
                  .join("")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {dashboard && (
            <DropdownMenuItem>
              <Link
                href={"/dashboard"}
                className="cursor-pointer flex items-center justify-start gap-2 w-full"
              >
                <MdDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Link
              href={"/dashboard/profile"}
              className="cursor-pointer flex items-center justify-start gap-2 w-full"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              href={"/dashboard/profile/edit"}
              className="cursor-pointer flex items-center justify-start gap-2 w-full"
            >
              {" "}
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            href={"/dashboard/help"}
            className="cursor-pointer flex items-center justify-start gap-2 w-full"
          >
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button
            onClick={handleSignOut}
            className="cursor-pointer flex items-center justify-start gap-2 w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
