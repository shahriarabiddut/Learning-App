import {
  LOGO,
  SITE_DEFAULTS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  XHandle,
} from "@/lib/constants/env";

type Metadata = {
  title?: string;
  description?: string;
  keywords?: string;
  robots?: string;
  url?: string;
  image?: string;
  twitterHandle?: string;
  siteName?: string;
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
};

export const generateMetadata = ({
  title = SITE_NAME,
  description = SITE_DESCRIPTION,
  keywords = SITE_DEFAULTS.keywords,
  robots = "index, follow",
  url = SITE_URL,
  image = LOGO,
  twitterHandle = XHandle,
  siteName = SITE_NAME,
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

  return {
    title: `${title} ${title.trim() != "" ? "|" : ""}  ${SITE_DEFAULTS.title} `,
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
  };
};
