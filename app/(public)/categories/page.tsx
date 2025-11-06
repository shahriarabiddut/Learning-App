import { SITE_DEFAULTS, SITE_NAME } from "@/lib/constants/env";
import type { Metadata } from "next";
import Script from "next/script";
import CategoriesPage from "@/components/pages/public/CategoriesPage";

// Static Metadata for Categories Listing Page
export const metadata: Metadata = {
  title: `Browse All Categories | ${SITE_DEFAULTS.title || SITE_NAME}`,
  description:
    "Explore all learning categories on our platform. Find courses and articles organized by topic to advance your skills and knowledge.",
  keywords: [
    "learning categories",
    "course categories",
    "online learning",
    "educational topics",
    "skill development",
    "e-learning categories",
    SITE_DEFAULTS.title || SITE_NAME,
  ],
  alternates: {
    canonical: `${SITE_DEFAULTS.url}/categories`,
    languages: {
      "en-US": `${SITE_DEFAULTS.url}/categories`,
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
    title: `Browse All Categories | ${SITE_DEFAULTS.title || SITE_NAME}`,
    description:
      "Explore all learning categories. Discover courses and articles organized by topic.",
    url: `${SITE_DEFAULTS.url}/categories`,
    siteName: SITE_DEFAULTS.title || SITE_NAME,
    images: [
      {
        url: SITE_DEFAULTS.logo || `${SITE_DEFAULTS.url}/og-categories.jpg`,
        width: 1200,
        height: 630,
        alt: "Browse Categories",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `Browse All Categories | ${SITE_DEFAULTS.title || SITE_NAME}`,
    description: "Explore all learning categories and discover new courses.",
    images: [
      SITE_DEFAULTS.logo || `${SITE_DEFAULTS.url}/twitter-categories.jpg`,
    ],
    site: SITE_DEFAULTS.XTwitterHandle,
    creator: SITE_DEFAULTS.XTwitterHandle,
  },
  metadataBase: new URL(SITE_DEFAULTS.url || "https://yoursite.com"),
};

export default function CategoriesListingPage() {
  const baseUrl = SITE_DEFAULTS.url || "https://yoursite.com";

  return (
    <>
      {/* Inject JSON-LD for Categories Page */}
      <Script
        id="categories-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Learning Categories",
            description: "Browse all learning categories on our platform",
            url: `${baseUrl}/categories`,
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
                name: "Categories",
                item: `${baseUrl}/categories`,
              },
            ],
          }),
        }}
        strategy="beforeInteractive"
      />

      {/* Organization JSON-LD */}
      <Script
        id="organization-jsonld"
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
        id="website-jsonld"
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

      <CategoriesPage />
    </>
  );
}
