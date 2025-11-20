// Database Connection
export const MONGODB_URL = process.env.MONGO_DB_CONNECTION_STRING || "";
export const NODE_ENV = process.env.NODE_ENV || "development";
// Extra API Keys
export const IMGBB_KEY = process.env.imgbbKey || "";

// Email API
export const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
export const SMTP_PORT = process.env.SMTP_PORT || "587";
export const MAIL_USER = process.env.MAIL_USER || "credentialsNotFound";
export const MAIL_PASS = process.env.MAIL_PASS || "credentialsNotFound";
export const MAIL_RECIPIENT =
  process.env.EMAIL_RECIPIENT || "credentialsNotFound";
export const SMTP_SECURE = process.env.SMTP_SECURE || false;

// SITE Information
export const FAVICON = process.env.NEXT_PUBLIC_FAVICON || "";
export const LOGO = process.env.NEXT_PUBLIC_LOGO || "";
export const SITE_URL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000/";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "BiddutProject";
export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "BiddutProject Description";
export const SITE_KEYWORDS = process.env.NEXT_PUBLIC_SITE_KEYWORDS || "";
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "shahriarabiddut@gmail.com";
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
export const CONTACT_ADDRESS = process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "";
export const DEFAULT_KEYWORDS =
  process.env.NEXT_PUBLIC_SITE_KEYWORDS ||
  [
    "blog",
    "learning",
    "lessons",
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
export const SITE_LOCALE = process.env.NEXT_PUBLIC_SITE_LOCALE || "en_US";

// Site Extra Information - Contact
export const SITE_CONTACTNO =
  process.env.NEXT_PUBLIC_SITE_CONTACTNO || "+1 (234) 567-890";
export const SITE_CONTACTNO2 =
  process.env.NEXT_PUBLIC_SITE_CONTACTNO2 || "+1 (234) 567-890";
export const WEEK_START =
  process.env.NEXT_PUBLIC_WEEK_START || `Monday - Friday: 8am - 4pm`;
export const WEEK_END =
  process.env.NEXT_PUBLIC_WEEK_END || `Saturday - Sunday: 9am - 5pm`;
export const POSTAL_CODE = process.env.NEXT_PUBLIC_POSTAL_CODE || ``;
export const COUNTRY = process.env.NEXT_PUBLIC_COUNTRY || ``;

// Configuration for Mailer
export const SENDER_NAME =
  process.env.NEXT_PUBLIC_SENDER_NAME || "BiddutProject";
export const SENDER_EMAIL =
  process.env.NEXT_PUBLIC_SENDER_EMAIL || "shahriarabiddut@gmail.com";

// Social
export const XHandle = process.env.NEXT_PUBLIC_XHandle || "";
export const SITE_FACEBOOK = process.env.NEXT_PUBLIC_SITE_FACEBOOK || "";
export const SITE_LINKEDIN = process.env.NEXT_PUBLIC_SITE_LINKEDIN || "";
export const SITE_PINTEREST = process.env.NEXT_PUBLIC_SITE_PINTEREST || "";
export const SITE_INSTAGRAM = process.env.NEXT_PUBLIC_SITE_INSTAGRAM || "";

// OAuth Credentials and Permissions
// Github - OAuth
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
// Google - OAuth
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
// Permissions - OAuth
const isGoogleEnabled = !!process.env.GOOGLE_CLIENT_ID;
const isGitHubEnabled = !!process.env.GITHUB_CLIENT_ID;
export const NEXT_PUBLIC_GOOGLE = isGoogleEnabled;
export const NEXT_PUBLIC_GITHUB = isGitHubEnabled;

export const API_SITE_URL = SITE_URL + "/api" || "http://localhost:3000/api";

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
  title: SITE_NAME,
  logo: LOGO,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  senderName: SENDER_NAME,
  siteUrl: SITE_URL,
  siteEmail: CONTACT_EMAIL,
  weekStart: WEEK_START,
  weekEnd: WEEK_END,
  postalCode: POSTAL_CODE,
  country: COUNTRY,
  contactno: SITE_CONTACTNO,
  contactno2: SITE_CONTACTNO2,
  XTwitterHandle: XHandle,
  Facebook: SITE_FACEBOOK,
  Instagram: SITE_INSTAGRAM,
  locale: SITE_LOCALE,
  keywords: SITE_KEYWORDS,
};

export const userRoles = [
  { label: "Admin", value: "admin" },
  { label: "Author", value: "author" },
  { label: "User", value: "user" },
  { label: "Subscriber", value: "subscriber" },
];
export const postStatus = [
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Revision", value: "revision" },
  { label: "Published", value: "published" },
];
export const pageStatus = [
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Revision", value: "revision" },
  { label: "Published", value: "published" },
];
