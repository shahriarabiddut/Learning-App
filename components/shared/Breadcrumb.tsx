"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string; // If no href, render as plain text
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <section className="w-full px-4 py-5 border-b-[1px] border-b-gray-100">
      <div className="w-11/12 max-w-screen-2xl mx-auto">
        <h3 className="font-semibold text-gray-400 dark:text-gray-100 font-poppins">
          {items.map((item, index) => (
            <span key={index}>
              {item.href ? (
                <Link href={item.href} className="hover:underline">
                  <span
                    className={`${
                      index === items.length - 1
                        ? "text-orange-400 capitalize"
                        : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span
                  className={`${
                    index === items.length - 1
                      ? "text-orange-400 capitalize"
                      : ""
                  }`}
                >
                  {item.label}
                </span>
              )}
              {index < items.length - 1 && " / "}
            </span>
          ))}
        </h3>
      </div>
    </section>
  );
}
