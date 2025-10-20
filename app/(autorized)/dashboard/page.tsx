import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";

// Dynamic Metadata generation for SEO
export const metadata = generateMetadata({
  title: `Dashboard | ${SITE_DEFAULTS.title}`,
  description: `Manage your account, update your profile, and access key dashboard features on ${SITE_DEFAULTS.title}.`,
  keywords: `dashboard, profile management, account settings, user panel, ${SITE_DEFAULTS.title}`,
  url: SITE_DEFAULTS.url + "/dashboard",
  image: SITE_DEFAULTS.logo,
});

export default async function Dashboard() {
  return (
    <div>
      <DashboardContent />
    </div>
  );
}
