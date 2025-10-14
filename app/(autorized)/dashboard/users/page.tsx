import { UsersPage } from "@/components/pages/UsersPage";
import React from "react";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";

// Dynamic Metadata generation for SEO
export const metadata = generateMetadata({
  title: `Users | ${SITE_DEFAULTS.siteName}`,
  description: `Explore all users on ${SITE_DEFAULTS.siteName}. View user details, profiles, and account information in one place.`,
  keywords: `users, user profiles, user list, ${SITE_DEFAULTS.siteName}, account information`,
  url: SITE_DEFAULTS.url + "/dashboard/users",
  image: SITE_DEFAULTS.siteLogo,
});

export default async function Users({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const searchData = await searchParams;
  const search = searchData.search || "";
  const UrlParams = { search: search };
  return <UsersPage extra={UrlParams} />;
}
