import { API_SITE_URL, SITE_DEFAULTS, SITE_NAME } from "@/lib/constants/env";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { IBlogPost } from "@/models/blogPost.model";
import { BlogPostView } from "@/components/pages/public/BlogPostView";

// Shared fetch function
const fetchBlogPost = async (id: string): Promise<IBlogPost> => {
  const res = await fetch(`${API_SITE_URL}/posts/public/slug/${id}`, {
    next: { revalidate: 600 }, // revalidate every 10 minutes
  });
  if (!res.ok) notFound();
  const data = await res.json();
  return data;
};

// Helper to generate JSON-LD for a Blog Post
function renderBlogPostJsonLd(post: IBlogPost, baseUrl: string) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.featuredImage ? [post.featuredImage] : [],
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.authorName || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_DEFAULTS.title || SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: SITE_DEFAULTS.logo || `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.id}`,
    },
    keywords: post.tags?.join(", ") || "",
    articleSection:
      post.categories && post.categories.length > 0
        ? typeof post.categories[0] === "string"
          ? post.categories[0]
          : post.categories[0]?.name
        : undefined,
    wordCount: post.content?.split(/\s+/).length || 0,
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
  };
  return JSON.stringify(jsonLd);
}

// Dynamic Metadata generation for Blog Post pages
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchBlogPost(id);
  const baseUrl = SITE_DEFAULTS.url;
  const canonical = `${baseUrl}/post/${post.id}`;

  // Get category name for keywords
  const categoryName =
    post.categories && post.categories.length > 0
      ? typeof post.categories[0] === "string"
        ? post.categories[0]
        : post.categories[0]?.name
      : "";

  // Merge any parent Open Graph images
  const parentMeta = await parent;
  const ogImages = post.featuredImage
    ? [post.featuredImage, ...(parentMeta.openGraph?.images ?? [])]
    : parentMeta.openGraph?.images ?? [];

  // Construct SEO title
  const seoTitle =
    post.seo?.title || `${post.title} | ${SITE_DEFAULTS.title || SITE_NAME}`;
  const seoDescription =
    post.seo?.description || post.excerpt || SITE_DEFAULTS.description;
  const seoKeywords = [
    ...(post.seo?.keywords || []),
    ...(post.tags || []),
    categoryName,
    post.authorName || "",
    SITE_DEFAULTS.title || SITE_NAME,
  ].filter(Boolean);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: {
      canonical,
      languages: {
        "en-US": canonical,
      },
    },
    robots: {
      index: post.isActive && post.status === "published",
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: post.seo?.ogTitle || post.title,
      description: post.seo?.ogDescription || seoDescription,
      url: canonical,
      siteName: SITE_DEFAULTS.title || SITE_NAME,
      images: ogImages,
      type: "article",
      locale: "en_US",
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorName || "Anonymous"],
      section: categoryName,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo?.twitterTitle || post.title,
      description: post.seo?.twitterDescription || seoDescription,
      images: post.featuredImage ? [post.featuredImage] : [],
      site: SITE_DEFAULTS.XTwitterHandle,
      creator: SITE_DEFAULTS.XTwitterHandle,
    },
    metadataBase: new URL(baseUrl),
  };
}

export default async function BlogPostPage(context: {
  params: Promise<{ id: string }>;
}) {
  const params = await context.params;
  const post = await fetchBlogPost(params.id);
  const baseUrl = SITE_DEFAULTS.url;

  return (
    <>
      {/* Inject JSON-LD */}
      <Script
        id="blog-post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderBlogPostJsonLd(post, baseUrl),
        }}
      />

      {/* Breadcrumb JSON-LD */}
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: baseUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: `${baseUrl}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: `${baseUrl}/post/${post.id}`,
              },
            ],
          }),
        }}
      />

      <BlogPostView initialPost={post} />
    </>
  );
}
