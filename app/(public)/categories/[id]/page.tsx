import { API_SITE_URL, SITE_DEFAULTS, SITE_NAME } from "@/lib/constants/env";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { ICategory } from "@/models/categories.model";
import SingleCategoryPage from "@/components/pages/public/SingleCategoryPage";

// Fetch category by ID or slug
const fetchCategory = async (id: string): Promise<ICategory> => {
  const res = await fetch(`${API_SITE_URL}/categories/${id}`, {
    next: { revalidate: 3600 }, // revalidate every hour
  });
  if (!res.ok) notFound();
  const data = await res.json();
  return data;
};

// Helper to generate JSON-LD for a Category
function renderCategoryJsonLd(category: ICategory, baseUrl: string) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description:
      category.description || `Browse ${category.name} courses and articles`,
    url: `${baseUrl}/category/${category.id}`,
    image: category.imageUrl ? [category.imageUrl] : [],
    publisher: {
      "@type": "Organization",
      name: SITE_DEFAULTS.title || SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: SITE_DEFAULTS.logo || `${baseUrl}/logo.png`,
      },
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_DEFAULTS.title || SITE_NAME,
      url: baseUrl,
    },
  };
  return JSON.stringify(jsonLd);
}

// Dynamic Metadata generation for Category pages
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const category = await fetchCategory(id);
  const baseUrl = SITE_DEFAULTS.url || "https://yoursite.com";
  const canonical = `${baseUrl}/category/${category.id}`;

  // Merge any parent Open Graph images
  const parentMeta = await parent;
  const ogImages = category.imageUrl
    ? [category.imageUrl, ...(parentMeta.openGraph?.images ?? [])]
    : parentMeta.openGraph?.images ?? [];

  // Construct SEO title and description
  const seoTitle = `${category.name} Courses & Articles | ${
    SITE_DEFAULTS.title || SITE_NAME
  }`;
  const seoDescription =
    category.description ||
    `Explore ${
      category.name
    } courses and educational content. Learn from expert instructors on ${
      SITE_DEFAULTS.title || SITE_NAME
    }.`;

  const seoKeywords = [
    category.name,
    `${category.name} courses`,
    `${category.name} tutorials`,
    `${category.name} learning`,
    "online courses",
    "e-learning",
    SITE_DEFAULTS.title || SITE_NAME,
  ];

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
      index: category.isActive,
      follow: true,
      nocache: false,
      googleBot: {
        index: category.isActive,
        follow: true,
      },
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: SITE_DEFAULTS.title || SITE_NAME,
      images: ogImages,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: category.imageUrl ? [category.imageUrl] : [],
      site: SITE_DEFAULTS.XTwitterHandle,
      creator: SITE_DEFAULTS.XTwitterHandle,
    },
    metadataBase: new URL(baseUrl),
    category: category.name,
  };
}

export default async function CategoryPage(context: {
  params: Promise<{ id: string }>;
}) {
  const params = await context.params;
  const category = await fetchCategory(params.id);
  const baseUrl = SITE_DEFAULTS.url || "https://yoursite.com";

  return (
    <>
      {/* Inject JSON-LD for Category */}
      <Script
        id="category-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderCategoryJsonLd(category, baseUrl),
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
              {
                "@type": "ListItem",
                position: 3,
                name: category.name,
                item: `${baseUrl}/category/${category.id}`,
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

      {/* ItemList JSON-LD for courses in category */}
      <Script
        id="itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${category.name} Courses`,
            description: category.description,
            numberOfItems: category.postCount || 0,
            itemListElement: [], // Will be populated by posts
          }),
        }}
        strategy="beforeInteractive"
      />

      <SingleCategoryPage categoryId={params.id} />
    </>
  );
}
