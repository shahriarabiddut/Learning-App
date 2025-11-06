import { PERMISSIONS } from "@/lib/middle/permissions";
import { Building, File, FilePlus, Files } from "lucide-react";
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
    permission: [PERMISSIONS.VIEW_USERS, PERMISSIONS.ADD_USERS],
    children: [
      {
        id: "users",
        name: "All Users",
        href: "/dashboard/users",
        icon: FaUsers,
        permission: PERMISSIONS.VIEW_USERS,
      },
      {
        id: "add-user",
        name: "Add New User",
        icon: FaPlus,
        href: "/dashboard/users/create",
        permission: PERMISSIONS.ADD_USERS,
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
  {
    name: "Posts",
    icon: File,
    permission: [PERMISSIONS.MANAGE_POSTS, PERMISSIONS.VIEW_POSTS],
    children: [
      {
        id: "posts",
        name: "All Posts",
        href: "/dashboard/posts",
        icon: Files,
        permission: PERMISSIONS.VIEW_POSTS,
      },
      {
        id: "add-post",
        name: "Add New Post",
        icon: FilePlus,
        href: "/dashboard/posts/create",
        permission: PERMISSIONS.MANAGE_POSTS,
        action: true,
        form: "post",
      },
    ],
  },
];
