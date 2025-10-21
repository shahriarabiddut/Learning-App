import { CategoriesPage } from "@/components/pages/CategoriesPage";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";

// Dynamic Metadata generation for SEO
export const metadata = generateMetadata({
  title: `Categories | ${SITE_DEFAULTS.title}`,
  description: `Discover and manage all blog categories on ${SITE_DEFAULTS.title}. Organize your articles, topics, and tags to enhance content discoverability and improve reader experience.`,
  keywords: `blog categories ${SITE_DEFAULTS.title}, manage blog categories, content organization, blog topics, article tags, blogging platform, blog management, content structure`,
  url: SITE_DEFAULTS.url + "/dashboard/categories",
  image: SITE_DEFAULTS.logo,
});

export default function Categories() {
  return <CategoriesPage />;
}
