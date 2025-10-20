import { CONTACT_ADDRESS, SITE_DEFAULTS } from "@/lib/constants/env";
import { formatAddress } from "@/lib/helper/clientHelper";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f5f3ef] dark:bg-gray-900 text-gray-700 dark:text-gray-300 pt-12 pb-8">
      <div className="max-w-screen-2xl w-11/12 mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
        {/* Information */}
        <div className="space-y-4 text-center">
          <h4 className="font-bold text-gray-900 dark:text-white text-[15px] uppercase tracking-wider mb-2">
            Information
          </h4>
          <ul className="space-y-3">
            {["About Us", "Privacy Policy", "Terms & Conditions"].map(
              (text) => (
                <li key={text}>
                  <a
                    href="#"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {text}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-4 text-center">
          <h4 className="font-bold text-gray-900 dark:text-white text-[15px] uppercase tracking-wider mb-2">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {["Blog", "My Account", "Wishlist"].map((text) => (
              <li key={text}>
                <a
                  href="#"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Brand & Contact */}
        <div className="col-span-2 md:col-span-1 space-y-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-wider ">
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 "
            >
              {SITE_DEFAULTS.logo ? (
                <Image
                  src={SITE_DEFAULTS.logo}
                  alt="Logo"
                  width={75}
                  height={75}
                  className="h-8 w-40 dark:bg-gray-50"
                  priority
                />
              ) : (
                <span className="font-bold text-xl text-foreground">
                  {SITE_DEFAULTS.title}
                </span>
              )}
            </Link>
          </div>
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

            <p className="text-gray-600 dark:text-gray-400">
              {formatAddress(CONTACT_ADDRESS)}
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4 text-center">
          <h4 className="font-bold text-gray-900 dark:text-white text-[15px] uppercase tracking-wider mb-2">
            Categories
          </h4>
          <ul className="space-y-3">
            {["ABC", "DEF", "GHI", "JKL", "MNO"].map((cat) => (
              <li key={cat}>
                <a
                  href="#"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4 text-center">
          <h4 className="font-bold text-gray-900 dark:text-white text-[15px] uppercase tracking-wider mb-2">
            Support
          </h4>
          <ul className="space-y-3">
            {[
              "Contact Us",
              "Newsletter",
              "Gift Cards",
              "Sign In",
              "My Account",
            ].map((text) => (
              <li key={text}>
                <a
                  href="#"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-screen-2xl w-11/12 mx-auto mt-12 pt-6 border-t border-gray-300 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600 dark:text-gray-400 text-center md:text-left">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-rose-600 font-semibold">
              {SITE_DEFAULTS.title}
            </span>{" "}
            All rights reserved.
          </p>

          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-3 justify-center">
              {/* Visa */}
              <svg
                width="40"
                height="24"
                viewBox="0 0 38 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="grayscale hover:grayscale-0 transition"
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
                className="grayscale hover:grayscale-0 transition"
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
                className="grayscale hover:grayscale-0 transition"
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
                className="grayscale hover:grayscale-0 transition"
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
                className="grayscale hover:grayscale-0 transition"
              >
                <rect width="40" height="24" rx="4" fill="#F47216" />
                <text
                  x="50%"
                  y="50%"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  Discover
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
