"use client";

import Link from "next/link";

interface BackButtonProps {
  href: string;
  labelText?: string;
  labelLink: string;
}

export default function BackButton({
  href,
  labelText,
  labelLink,
}: BackButtonProps) {
  return (
    <div className="inline-flex flex-wrap w-full justify-center items-center mx-1">
      <p>{labelText}</p>
      <button className="font-normal text-blue-400 hover:text-blue-900 hover:underline">
        <Link href={href}>{labelLink}</Link>
      </button>
    </div>
  );
}
