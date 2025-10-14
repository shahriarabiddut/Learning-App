import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { SITE_DEFAULTS } from "@/lib/constants/env";

const font = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface HeaderProps {
  title: string;
  label: string;
  link: string;
}

export default function Header({ title, label, link }: HeaderProps) {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      {link !== "disabled" ? (
        <Link href={link}>
          {" "}
          <h1
            className={cn(
              "text-3xl font-semibold text-center cursor-pointer hover:text-sky-500",
              font.className
            )}
          >
            {title}
          </h1>
        </Link>
      ) : (
        <>
          {SITE_DEFAULTS.siteLogo !== "" && (
            <Image
              src={SITE_DEFAULTS.siteLogo || ""}
              alt="Logo"
              width={250}
              height={250}
              className="h-8 w-auto dark:bg-gray-50"
            />
          )}
          {SITE_DEFAULTS.siteLogo === "" && (
            <span className="font-bold text-xl text-foreground">
              {SITE_DEFAULTS.siteName}
            </span>
          )}
        </>
      )}

      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
