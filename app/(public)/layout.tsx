"use client";

import Footer from "@/components/Footer";
import Header from "@/components/shared/Header";
import type React from "react";
import { Toaster } from "sonner";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="relative min-h-screen flex flex-col bg-white dark:bg-slate-900">
        <Header />
        <section className="flex-1">{children}</section>
        <Footer />
      </main>
      <Toaster />
    </>
  );
}
