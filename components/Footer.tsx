"use client";

import { CONTACT_ADDRESS, SITE_DEFAULTS } from "@/lib/constants/env";
import { formatAddress } from "@/lib/helper/clientHelper";
import { useFetchCategoriesQuery } from "@/lib/redux-features/categories/categoriesApi";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  GraduationCap,
  Award,
  Users,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Fetch categories from API
  const { data: categoriesData } = useFetchCategoriesQuery({
    page: 1,
    limit: 50,
    sortBy: "name-asc",
  });

  // Get only parent categories (no parentCategory)
  const parentCategories = useMemo(() => {
    if (!categoriesData?.data) return [];
    return categoriesData.data
      .filter((cat) => cat.isActive && !cat.parentCategory)
      .slice(0, 5);
  }, [categoriesData]);

  const quickLinks = [
    { name: "All Courses", href: "/courses" },
    { name: "Become Instructor", href: "/instructor/apply" },
    { name: "Success Stories", href: "/success-stories" },
    { name: "Help Center", href: "/help" },
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "#",
      icon: <Facebook className="w-5 h-5" />,
      color: "hover:bg-blue-600",
    },
    {
      name: "Twitter",
      href: "#",
      icon: <Twitter className="w-5 h-5" />,
      color: "hover:bg-sky-500",
    },
    {
      name: "LinkedIn",
      href: "#",
      icon: <Linkedin className="w-5 h-5" />,
      color: "hover:bg-blue-700",
    },
    {
      name: "Instagram",
      href: "#",
      icon: <Instagram className="w-5 h-5" />,
      color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600",
    },
  ];

  const stats = [
    { icon: <BookOpen className="w-5 h-5" />, value: "10K+", label: "Courses" },
    { icon: <Users className="w-5 h-5" />, value: "100K+", label: "Students" },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      value: "500+",
      label: "Instructors",
    },
    {
      icon: <Award className="w-5 h-5" />,
      value: "50K+",
      label: "Certificates",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-300">
      {/* Stats Bar */}
      <div className="border-b border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 dark:bg-slate-900/50 border border-slate-700/50 dark:border-slate-800/50 hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Contact - Takes 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block group">
              {SITE_DEFAULTS.logo ? (
                <Image
                  src={SITE_DEFAULTS.logo}
                  alt="Logo"
                  width={180}
                  height={40}
                  className="h-10 w-auto brightness-0 invert dark:brightness-100 dark:invert-0"
                  priority
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-2xl text-white">
                    {SITE_DEFAULTS.title}
                  </span>
                </div>
              )}
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering learners worldwide with high-quality education. Join
              thousands of students achieving their goals through expert-led
              courses.
            </p>

            {/* Contact Information */}
            <div className="space-y-3">
              {SITE_DEFAULTS.email && (
                <a
                  href={`mailto:${SITE_DEFAULTS.email}`}
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 group"
                >
                  <div className="p-2 rounded-lg bg-slate-800 dark:bg-slate-900 group-hover:bg-emerald-600 transition-colors duration-200">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>{SITE_DEFAULTS.email}</span>
                </a>
              )}

              {SITE_DEFAULTS.contactno && (
                <a
                  href={`tel:${SITE_DEFAULTS.contactno}`}
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 group"
                >
                  <div className="p-2 rounded-lg bg-slate-800 dark:bg-slate-900 group-hover:bg-emerald-600 transition-colors duration-200">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>{SITE_DEFAULTS.contactno}</span>
                </a>
              )}

              {CONTACT_ADDRESS && (
                <div className="flex items-start gap-3 text-sm text-slate-400">
                  <div className="p-2 rounded-lg bg-slate-800 dark:bg-slate-900 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="flex-1">
                    {formatAddress(CONTACT_ADDRESS)}
                  </span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-xl bg-slate-800 dark:bg-slate-900 text-slate-400 hover:text-white transition-all duration-300 ${social.color}`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Categories - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-bold text-white text-base uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
              Categories
            </h4>
            <ul className="space-y-2.5">
              {parentCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.id}`}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                    {category.name}
                  </Link>
                </li>
              ))}
              {parentCategories.length === 0 && (
                <li className="text-sm text-slate-500">
                  No categories available
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-white text-base uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-bold text-white text-base uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter Signup */}
            <div className="pt-4">
              <p className="text-xs text-slate-400 mb-3">
                Subscribe to our newsletter
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 text-sm bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 rounded-lg text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-slate-400 text-center md:text-left">
              © {currentYear}{" "}
              <span className="text-emerald-400 font-semibold">
                {SITE_DEFAULTS.title}
              </span>
              . All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 mr-2">We accept:</span>

              {/* Visa */}
              <div className="px-3 py-1.5 bg-slate-800 dark:bg-slate-900 rounded border border-slate-700 dark:border-slate-800 grayscale hover:grayscale-0 transition-all duration-200">
                <svg width="32" height="20" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="3" fill="#1A1F71" />
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
              </div>

              {/* MasterCard */}
              <div className="px-3 py-1.5 bg-slate-800 dark:bg-slate-900 rounded border border-slate-700 dark:border-slate-800 grayscale hover:grayscale-0 transition-all duration-200">
                <svg width="32" height="20" viewBox="0 0 40 24" fill="none">
                  <rect width="40" height="24" rx="3" fill="#252525" />
                  <circle cx="16" cy="12" r="7" fill="#EB001B" />
                  <circle cx="24" cy="12" r="7" fill="#F79E1B" />
                </svg>
              </div>

              {/* PayPal */}
              <div className="px-3 py-1.5 bg-slate-800 dark:bg-slate-900 rounded border border-slate-700 dark:border-slate-800 grayscale hover:grayscale-0 transition-all duration-200">
                <svg width="32" height="20" viewBox="0 0 40 24" fill="none">
                  <rect width="40" height="24" rx="3" fill="#003087" />
                  <text
                    x="50%"
                    y="50%"
                    fill="white"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    PayPal
                  </text>
                </svg>
              </div>

              {/* Amex */}
              <div className="px-3 py-1.5 bg-slate-800 dark:bg-slate-900 rounded border border-slate-700 dark:border-slate-800 grayscale hover:grayscale-0 transition-all duration-200">
                <svg width="32" height="20" viewBox="0 0 40 24" fill="none">
                  <rect width="40" height="24" rx="3" fill="#2E77BC" />
                  <text
                    x="50%"
                    y="50%"
                    fill="white"
                    fontSize="6"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    AMEX
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="mt-4 pt-4 border-t border-slate-800 dark:border-slate-900">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
              <Link
                href="/privacy"
                className="hover:text-emerald-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                className="hover:text-emerald-400 transition-colors"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <Link
                href="/cookies"
                className="hover:text-emerald-400 transition-colors"
              >
                Cookie Policy
              </Link>
              <span>•</span>
              <Link
                href="/accessibility"
                className="hover:text-emerald-400 transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
