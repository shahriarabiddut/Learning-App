import { PERMISSIONS } from "@/lib/middle/permissions";
import { FaPlus, FaThLarge, FaUsers } from "react-icons/fa";

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
        id: "users",
        name: "All Users",
        href: "/dashboard/users",
        icon: FaUsers,
        permission: PERMISSIONS.MANAGE_USERS,
      },
      {
        id: "add-user",
        name: "Add New User",
        icon: FaPlus,
        href: "/dashboard/users/create",
        permission: PERMISSIONS.MANAGE_USERS,
        action: true,
        form: "user",
      },
    ],
  },
];
