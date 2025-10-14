"use client";

import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import type React from "react";
import { Toaster } from "sonner";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Use usePathname hook
  const isHomePage = pathname === "/"; // Now compare pathname directly

  return (
    <>
      <main className="relative min-h-screen flex flex-col ">
        <section className="flex-1">{children}</section>
        <Footer />
      </main>
      <Toaster />
    </>
  );
}
