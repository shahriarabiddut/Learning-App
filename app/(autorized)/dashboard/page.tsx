import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";

// Dynamic Metadata generation for SEO
export const metadata = generateMetadata({
  title: `Dashboard | ${SITE_DEFAULTS.siteName}`,
  description: `Manage your account, update your profile, and access key dashboard features on ${SITE_DEFAULTS.siteName}.`,
  keywords: `dashboard, profile management, account settings, user panel, ${SITE_DEFAULTS.siteName}`,
  url: SITE_DEFAULTS.url + "/dashboard",
  image: SITE_DEFAULTS.siteLogo,
});

export default async function Dashboard() {
  return (
    <div>
      <DashboardContent />
    </div>
  );
}
