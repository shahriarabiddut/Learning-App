import { CONTACT_ADDRESS, SITE_DEFAULTS } from "@/lib/constants/env";
import { formatAddress } from "@/lib/helper/clientHelper";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f5f3ef] dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand & Contact */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="mb-4">
              <Link href="/" className="inline-block">
                {SITE_DEFAULTS.logo ? (
                  <Image
                    src={SITE_DEFAULTS.logo}
                    alt="Logo"
                    width={160}
                    height={32}
                    className="h-8 w-40 dark:bg-gray-50"
                    priority
                  />
                ) : (
                  <span className="font-bold text-xl text-gray-900 dark:text-white">
                    {SITE_DEFAULTS.title}
                  </span>
                )}
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Discover inspiring stories and expert insights.
            </p>
            <div className="space-y-2 text-sm">
              {SITE_DEFAULTS.contactno && (
                <p>
                  <a
                    href={`tel:${SITE_DEFAULTS.contactno}`}
                    className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {SITE_DEFAULTS.contactno}
                  </a>
                </p>
              )}
              {SITE_DEFAULTS.contactno2 && (
                <p>
                  <a
                    href={`tel:${SITE_DEFAULTS.contactno2}`}
                    className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {SITE_DEFAULTS.contactno2}
                  </a>
                </p>
              )}
              {SITE_DEFAULTS.email && (
                <p>
                  <a
                    href={`mailto:${SITE_DEFAULTS.email}`}
                    className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {SITE_DEFAULTS.email}
                  </a>
                </p>
              )}
              {CONTACT_ADDRESS && (
                <p className="text-gray-600 dark:text-gray-400">
                  {formatAddress(CONTACT_ADDRESS)}
                </p>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              {["Lifestyle", "Technology", "Home", "Travel", "Fashion"].map(
                (cat) => (
                  <li key={cat}>
                    <Link
                      href="#"
                      className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                    >
                      {cat}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              {["Blog", "My Account", "Wishlist", "Gift Cards"].map((text) => (
                <li key={text}>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
              Information
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                "About Us",
                "Contact Us",
                "Privacy Policy",
                "Terms & Conditions",
              ].map((text) => (
                <li key={text}>
                  <Link
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
              Follow Us
            </h4>
            <ul className="space-y-2.5 text-sm">
              {["Twitter", "LinkedIn", "Instagram", "Facebook"].map(
                (social) => (
                  <li key={social}>
                    <Link
                      href="#"
                      className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                    >
                      {social}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-300 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              <span className="text-rose-600 font-semibold">
                {SITE_DEFAULTS.title}
              </span>
              . All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              {/* Visa */}
              <svg
                width="40"
                height="24"
                viewBox="0 0 38 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="grayscale hover:grayscale-0 transition-all duration-200"
              >
                <rect width="38" height="24" rx="4" fill="#1A1F71" />
                <text
                  x="50%"
                  y="50%"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  VISA
                </text>
              </svg>

              {/* MasterCard */}
              <svg
                width="40"
                height="24"
                viewBox="0 0 40 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="grayscale hover:grayscale-0 transition-all duration-200"
              >
                <rect width="40" height="24" rx="4" fill="#EB001B" />
                <circle cx="24" cy="12" r="8" fill="#F79E1B" />
                <circle cx="16" cy="12" r="8" fill="#EB001B" />
              </svg>

              {/* PayPal */}
              <svg
                width="40"
                height="24"
                viewBox="0 0 40 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="grayscale hover:grayscale-0 transition-all duration-200"
              >
                <rect width="40" height="24" rx="4" fill="#003087" />
                <text
                  x="50%"
                  y="50%"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  PayPal
                </text>
              </svg>

              {/* Amex */}
              <svg
                width="40"
                height="24"
                viewBox="0 0 40 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="grayscale hover:grayscale-0 transition-all duration-200"
              >
                <rect width="40" height="24" rx="4" fill="#2E77BC" />
                <text
                  x="50%"
                  y="50%"
                  fill="white"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  AMEX
                </text>
              </svg>

              {/* Discover */}
              <svg
                width="40"
                height="24"
                viewBox="0 0 40 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="grayscale hover:grayscale-0 transition-all duration-200"
              >
                <rect width="40" height="24" rx="4" fill="#F47216" />
                <text
                  x="50%"
                  y="50%"
                  fill="white"
                  fontSize="6"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  DISCOVER
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
