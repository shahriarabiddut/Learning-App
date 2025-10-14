"use client";

import SyncManager from "@/components/shared/SyncManager";
import { ProvidersPack } from "@/components/ProvidersPack";
import { LoaderWrapper } from "@/components/shared/Loader/LoaderWrapper";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProvidersPack>
      <SyncManager />
      <LoaderWrapper>{children}</LoaderWrapper>
      <Toaster position="bottom-right" expand closeButton />
    </ProvidersPack>
  );
}
