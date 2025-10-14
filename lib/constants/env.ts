export const MONGODB_URL = process.env.MONGO_DB_CONNECTION_STRING || "";
export const MAPTILERKEY = process.env.NEXT_PUBLIC_MAPTILERKEY || "";
export const IMGBB_KEY = process.env.imgbbKey || "";

export const BASE_URL = process.env.BETTER_AUTH_URL || "";
export const LOGO = process.env.NEXT_PUBLIC_LOGO || "";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
export const SMTP_PORT = process.env.SMTP_PORT || "587";
export const MAIL_USER = process.env.MAIL_USER || "credentialsNotFound";
export const MAIL_PASS = process.env.MAIL_PASS || "credentialsNotFound";
export const MAIL_RECIPIENT =
  process.env.EMAIL_RECIPIENT || "credentialsNotFound";
export const SMTP_SECURE = process.env.SMTP_SECURE || false;

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "BiddutProject";
export const SENDER_NAME =
  process.env.NEXT_PUBLIC_SENDER_NAME || "BiddutProject";
export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "BiddutProject Description";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/";
export const SITE_EMAIL =
  process.env.NEXT_PUBLIC_SITE_EMAIL || "shahriarabiddut@gmail.com";
export const SITE_XHandle = process.env.NEXT_PUBLIC_SITE_XHandle || "";
export const SITE_LOCALE = process.env.NEXT_PUBLIC_SITE_LOCALE || "en_US";
export const DEFAULT_KEYWORDS =
  process.env.NEXT_PUBLIC_SITE_KEYWORDS ||
  [
    "blog",
    "learning",
    "courses",
    "tutorials",
    "education",
    "development",
    "programming",
    "coding",
    "technology",
    "web development",
    "javascript",
    "python",
    "java",
    "machine learning",
    "data science",
  ].join(", ");
export const SITE_FACEBOOK = process.env.NEXT_PUBLIC_SITE_FACEBOOK || "";
export const SITE_INSTAGRAM = process.env.NEXT_PUBLIC_SITE_INSTAGRAM || "";
export const SITE_CONTACTNO =
  process.env.NEXT_PUBLIC_SITE_CONTACTNO || "+1 (234) 567-890";
export const SITE_CONTACTNO2 =
  process.env.NEXT_PUBLIC_SITE_CONTACTNO2 || "+1 (234) 567-890";
export const WEEK_START =
  process.env.NEXT_PUBLIC_WEEK_START || `Monday - Friday: 8am - 4pm`;
export const WEEK_END =
  process.env.NEXT_PUBLIC_WEEK_END || `Saturday - Sunday: 9am - 5pm`;

// OAuth Credentials and Permissions
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const isGoogleEnabled = !!process.env.GOOGLE_CLIENT_ID;
const isGitHubEnabled = !!process.env.GITHUB_CLIENT_ID;
export const NEXT_PUBLIC_GOOGLE = isGoogleEnabled;
export const NEXT_PUBLIC_GITHUB = isGitHubEnabled;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL + "/api" || "http://localhost:3000/api";
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "shahriarabiddut@gmail.com";

export const protectedRoutes = [
  "/dashboard",
  "/dashboard/:path*", // All subroutes under /dashboard
];
// Define routes that logged-in users **should not** access
export const loggedInInvalidRoutes = [
  "/sign-",
  "/email-verification",
  "/reset-password",
  "/2fa-verification",
];

// Site Defaults
export const SITE_DEFAULTS = {
  siteName: SITE_NAME,
  siteLogo: LOGO,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: SITE_EMAIL,
  senderName: SENDER_NAME,
  siteUrl: SITE_URL,
  siteEmail: SITE_EMAIL,
  address1: `Mohakhali DOHS`,
  address2: ` Dhaka 1206,Bangladesh`,
  weekStart: WEEK_START,
  weekEnd: WEEK_END,
  postalCode: `1206`,
  country: `Bangladesh`,
  contactno: SITE_CONTACTNO,
  contactno2: SITE_CONTACTNO2,
  XTwitterHandle: SITE_XHandle,
  Facebook: SITE_FACEBOOK,
  Instagram: SITE_INSTAGRAM,
  locale: SITE_LOCALE,
  keywords: DEFAULT_KEYWORDS,
};
