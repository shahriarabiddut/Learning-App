import React from "react";
import { Toaster } from "sonner";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col h-screen justify-center items-center bg-gradient-to-r from-blue-800 via-sky-500  to-blue-800">
      {children}

      <Toaster />
    </section>
  );
}
