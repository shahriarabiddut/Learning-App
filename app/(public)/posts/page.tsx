import LatestPostsPage from "@/components/pages/public/LatestPostPage";
import { SITE_DEFAULTS, SITE_NAME } from "@/lib/constants/env";
import type { Metadata } from "next";
import Script from "next/script";

// Static Metadata for Posts Listing Page
export const metadata: Metadata = {
  title: `Browse All Posts | ${SITE_DEFAULTS.title || SITE_NAME}`,
  description:
    "Explore all blog posts, tutorials, and articles on our platform. Find the latest lessons and in-depth articles to advance your skills and knowledge.",
  keywords: [
    "blog posts",
    "articles",
    "tutorials",
    "learning posts",
    "online articles",
    "skill development",
    SITE_DEFAULTS.title || SITE_NAME,
  ],
  alternates: {
    canonical: `${SITE_DEFAULTS.url}/posts`,
    languages: {
      "en-US": `${SITE_DEFAULTS.url}/posts`,
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: `Browse All Posts | ${SITE_DEFAULTS.title || SITE_NAME}`,
    description:
      "Browse our latest blog posts, tutorials, and articles organized by topic.",
    url: `${SITE_DEFAULTS.url}/posts`,
    siteName: SITE_DEFAULTS.title || SITE_NAME,
    images: [
      {
        url: SITE_DEFAULTS.logo || `${SITE_DEFAULTS.url}/og-posts.jpg`,
        width: 1200,
        height: 630,
        alt: "Browse Posts",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `Browse All Posts | ${SITE_DEFAULTS.title || SITE_NAME}`,
    description: "Explore our latest posts and articles.",
    images: [SITE_DEFAULTS.logo || `${SITE_DEFAULTS.url}/twitter-posts.jpg`],
    site: SITE_DEFAULTS.XTwitterHandle,
    creator: SITE_DEFAULTS.XTwitterHandle,
  },
  metadataBase: new URL(SITE_DEFAULTS.url || ""),
};

export default function PostsListingPage() {
  const baseUrl = SITE_DEFAULTS.url || "";

  return (
    <>
      {/* Inject JSON-LD for Posts Listing Page */}
      <Script
        id="posts-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Posts",
            description: "Browse all blog posts and articles on our platform",
            url: `${baseUrl}/posts`,
            isPartOf: {
              "@type": "WebSite",
              name: SITE_DEFAULTS.title || SITE_NAME,
              url: baseUrl,
            },
            publisher: {
              "@type": "Organization",
              name: SITE_DEFAULTS.title || SITE_NAME,
              logo: {
                "@type": "ImageObject",
                url: SITE_DEFAULTS.logo || `${baseUrl}/logo.png`,
              },
            },
          }),
        }}
        strategy="beforeInteractive"
      />

      {/* Breadcrumb JSON-LD */}
      <Script
        id="breadcrumb-posts-jsonld"
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
                name: "Posts",
                item: `${baseUrl}/posts`,
              },
            ],
          }),
        }}
        strategy="beforeInteractive"
      />

      {/* Organization JSON-LD */}
      <Script
        id="organization-jsonld-posts"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_DEFAULTS.title || SITE_NAME,
            url: baseUrl,
            logo: SITE_DEFAULTS.logo || `${baseUrl}/logo.png`,
            sameAs: [
              SITE_DEFAULTS.facebook,
              SITE_DEFAULTS.twitter,
              SITE_DEFAULTS.linkedin,
              SITE_DEFAULTS.instagram,
            ].filter(Boolean),
          }),
        }}
        strategy="beforeInteractive"
      />

      {/* Website JSON-LD */}
      <Script
        id="website-jsonld-posts"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_DEFAULTS.title || SITE_NAME,
            url: baseUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: `${baseUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
        strategy="beforeInteractive"
      />

      <LatestPostsPage />
    </>
  );
}
