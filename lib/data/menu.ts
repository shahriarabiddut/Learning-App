import { PERMISSIONS } from "@/lib/middle/permissions";
import { FaThLarge, FaUsers } from "react-icons/fa";

export const NAV_LINKS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: FaThLarge,
  },
  {
    name: "Users",
    icon: FaUsers,
    permission: PERMISSIONS.MANAGE_USERS,
    children: [
      {
        name: "All Users",
        href: "/dashboard/users",
        icon: FaUsers,
        permission: PERMISSIONS.MANAGE_USERS,
      },
    ],
  },
];
