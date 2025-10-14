import { BASE_URL } from "@/lib/constants/env";
import { magicLinkClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [twoFactorClient(), magicLinkClient()],
});
export const { useSession } = authClient;
