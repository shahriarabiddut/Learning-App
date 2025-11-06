import HomePage from "@/components/pages/HomePage";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";
import React from "react";
export const metadata = generateMetadata({
  title: `Home | ${SITE_DEFAULTS.title}`,
  description: `Explore all users on ${SITE_DEFAULTS.title}. View user details, profiles, and account information in one place.`,
  keywords: `users, user profiles, user list, ${SITE_DEFAULTS.title}, account information`,
  url: SITE_DEFAULTS.url,
  image: SITE_DEFAULTS.logo,
});
const page = () => {
  return <HomePage />;
};

export default page;
