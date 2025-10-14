import { SITE_DEFAULTS } from "../constants/env";

type Metadata = {
  title?: string;
  description?: string;
  keywords?: string;
  robots?: string;
  url?: string;
  image?: string;
  twitterHandle?: string;
  // New properties for e-commerce enhancements
  price?: string;
  availability?: "in stock" | "out of stock" | "preorder";
  currency?: string;
  type?: "website" | "product" | "article";
  siteName?: string;
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
};

export const generateMetadata = ({
  title = ``,
  description = `${SITE_DEFAULTS.siteName} is your go‑to online store for the latest sneakers, boots, and fashion accessories. Browse curated collections, enjoy fast shipping, and shop exclusive deals on top‑brand footwear in every style and size.`,
  keywords = SITE_DEFAULTS.keywords,
  robots = "index, follow",
  url = SITE_DEFAULTS.url,
  image = SITE_DEFAULTS.siteLogo,
  twitterHandle = SITE_DEFAULTS.XTwitterHandle,
  // E-commerce specific defaults
  price = "",
  availability = "in stock",
  currency = "USD",
  type = "website",
  siteName = SITE_DEFAULTS.siteName,
  locale = SITE_DEFAULTS.locale,
  publishedTime = "",
  modifiedTime = "",
}: Metadata) => {
  const openGraphImages = image
    ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ]
    : [];

  // if (type === "product") {
  // }
  return {
    title: `${title} ${title.trim() != "" ? "|" : ""}  ${
      SITE_DEFAULTS.siteName
    } `,
    description,
    keywords: keywords || SITE_DEFAULTS.keywords,
    robots,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type,
      siteName,
      locale,
      images: openGraphImages,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      title,
      description,
      images: image ? [image] : [],
    },
    // E-commerce specific structured data
    other: {
      ...(price && {
        "product:price:amount": price,
        "product:price:currency": currency,
        "product:availability": availability,
      }),
    },
  };
};
