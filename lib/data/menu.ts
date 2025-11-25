import { PERMISSIONS } from "@/lib/middle/permissions";
import { Building, FilePlus } from "lucide-react";
import {
  FaFile,
  FaFileAlt,
  FaFilePowerpoint,
  FaPlus,
  FaThLarge,
  FaUsers,
} from "react-icons/fa";
import {
  FaBuildingFlag,
  FaFileMedical,
  FaRegFilePowerpoint,
} from "react-icons/fa6";

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
    permission: [PERMISSIONS.ADD_CATEGORIES, PERMISSIONS.VIEW_CATEGORIES],
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
        permission: PERMISSIONS.ADD_CATEGORIES,
        action: true,
        form: "category",
      },
    ],
  },
  {
    name: "Posts",
    icon: FaFile,
    permission: [PERMISSIONS.MANAGE_POSTS, PERMISSIONS.VIEW_POSTS],
    children: [
      {
        id: "posts",
        name: "All Posts",
        href: "/dashboard/posts",
        icon: FaFileAlt,
        permission: PERMISSIONS.VIEW_POSTS,
      },
      {
        id: "add-post",
        name: "Add New Post",
        icon: FaFileMedical,
        href: "/dashboard/posts/create",
        permission: PERMISSIONS.MANAGE_POSTS,
        action: true,
        form: "post",
      },
    ],
  },

  {
    name: "Pages",
    icon: FaFilePowerpoint,
    permission: [PERMISSIONS.MANAGE_PAGES, PERMISSIONS.VIEW_PAGES],
    children: [
      {
        id: "Pages",
        name: "All Pages",
        href: "/dashboard/pages",
        icon: FaRegFilePowerpoint,
        permission: PERMISSIONS.VIEW_PAGES,
      },
      {
        id: "add-page",
        name: "Add New Page",
        icon: FilePlus,
        href: "/dashboard/page/create",
        permission: PERMISSIONS.MANAGE_PAGES,
        action: true,
        form: "page",
      },
    ],
  },
];
