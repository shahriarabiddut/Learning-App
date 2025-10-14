"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import SharedLoader from "./SharedLoader";

export function LoaderWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip on first mount
    if (prevPath.current !== null && prevPath.current !== pathname) {
      setLoading(true);

      // hide after a short delay – you can tie this to your own fetch promises
      const t = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(t);
    }

    prevPath.current = pathname;
  }, [pathname]);

  return (
    <>
      {loading && <SharedLoader />}
      {!loading && children}
    </>
  );
}
