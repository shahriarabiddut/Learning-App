import { BlogPagePage } from "@/components/pages/BlogPagePage";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";

// Dynamic Metadata generation for SEO
export const metadata = generateMetadata({
  title: `Pages | ${SITE_DEFAULTS.title}`,
  description: `Explore and manage all blog pages on ${SITE_DEFAULTS.title}. Create, edit, and publish engaging articles to share insights, stories, and updates with your audience.`,
  keywords: `blog pages ${SITE_DEFAULTS.title}, create blog, write articles, publish pages, content management, blogging platform, page editor, blog writing`,
  url: SITE_DEFAULTS.url + "/dashboard/pages",
  image: SITE_DEFAULTS.logo,
});

export default function Categories() {
  return <BlogPagePage />;
}
