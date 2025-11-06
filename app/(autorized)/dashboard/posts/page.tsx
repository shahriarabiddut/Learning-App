import { BlogPostPage } from "@/components/pages/public/BlogPostPage";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";

// Dynamic Metadata generation for SEO
export const metadata = generateMetadata({
  title: `Posts | ${SITE_DEFAULTS.title}`,
  description: `Explore and manage all blog posts on ${SITE_DEFAULTS.title}. Create, edit, and publish engaging articles to share insights, stories, and updates with your audience.`,
  keywords: `blog posts ${SITE_DEFAULTS.title}, create blog, write articles, publish posts, content management, blogging platform, post editor, blog writing`,
  url: SITE_DEFAULTS.url + "/dashboard/posts",
  image: SITE_DEFAULTS.logo,
});

export default function Categories() {
  return <BlogPostPage />;
}
