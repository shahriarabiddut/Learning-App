import { PERMISSIONS } from "@/lib/middle/permissions";
import { Building } from "lucide-react";
import { FaPlus, FaThLarge, FaUsers } from "react-icons/fa";
import { FaBuildingFlag } from "react-icons/fa6";

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
  {
    name: "Categories",
    icon: Building,
    permission: [PERMISSIONS.MANAGE_CATEGORIES, PERMISSIONS.VIEW_CATEGORIES],
    children: [
      {
        id: "categories",
        name: "All Categories",
        href: "/dashboard/categories",
        icon: FaBuildingFlag,
        permission: PERMISSIONS.VIEW_CATEGORIES,
      },
      {
        id: "add-category",
        name: "Add New Category",
        icon: Building,
        href: "/dashboard/categories/create",
        permission: PERMISSIONS.MANAGE_CATEGORIES,
        action: true,
        form: "category",
      },
    ],
  },
];
