import DisabledAccountPage from "@/components/pages/DisabledAccountPage";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";

// Dynamic Metadata generation for SEO
export const metadata = generateMetadata({
  title: `Account Disabled `,
  description: `Your account on ${SITE_DEFAULTS.siteName} has been disabled. Please contact our support team if you believe this was done in error or need further assistance.`,
  keywords: `account disabled ${SITE_DEFAULTS.siteName}, login issue, account locked, support needed, user access problem, contact support, account access issue, suspended account, ${SITE_DEFAULTS.siteName} help`,
  url: SITE_DEFAULTS.url + "/account-disabled",
  image: SITE_DEFAULTS.siteLogo,
});

export default function ComparePage() {
  return (
    <>
      <DisabledAccountPage />
    </>
  );
}
