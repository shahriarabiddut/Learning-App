import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";

export const metadata = generateMetadata({
  title: `404 - Page Not Found `,
  url: SITE_DEFAULTS.url,
  image: SITE_DEFAULTS.logo,
});

export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white flex items-center justify-center px-6 py-12 text-center">
      <div className="absolute inset-0 bg-gradient-radial from-gray-800 via-gray-900 to-black opacity-80 z-0" />
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.04] z-0 pointer-events-none" />
      <div className="relative z-10 max-w-xl">
        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight text-white mb-6">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-medium text-gray-300 mb-4">
          Page Not Found
        </p>
        <p className="text-gray-400 mb-8">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
        >
          <ArrowLeft size={18} />
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
