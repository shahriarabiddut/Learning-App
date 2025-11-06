import React from "react";
import { Toaster } from "sonner";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col h-screen justify-center items-center bg-gradient-to-r from-emerald-800 via-teal-500  to-emerald-800">
      {children}

      <Toaster />
    </section>
  );
}
