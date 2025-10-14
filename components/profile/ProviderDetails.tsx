"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/better-auth-client-and-actions/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { toast } from "sonner";
import SharedMiniLoader from "@/components/shared/Loader/SharedMiniLoader";

export default function ProviderDetails({
  provider,
  accountId,
  providers,
}: {
  provider: string | null;
  accountId?: string | null;
  providers?: boolean[] | null;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const getProviderDetails = (provider: string | null) => {
    switch (provider) {
      case "google":
        return {
          icon: <FaGoogle className="text-red-500" />,
          label: "Google",
          bg: "bg-muted",
          text: "text-primary",
        };
      case "github":
        return {
          icon: <FaGithub className="text-foreground" />,
          label: "GitHub",
          bg: "bg-muted",
          text: "text-foreground",
        };
      default:
        return {
          icon: null,
          label: provider || "Unknown",
          bg: "bg-muted",
          text: "text-muted-foreground",
        };
    }
  };

  const { icon, label, bg, text } = getProviderDetails(provider);

  const handleUnlink = async (provider: string) => {
    if (!accountId) {
      toast.error("Missing account ID. Cannot unlink.");
      return;
    }

    try {
      setLoading(true);
      await authClient.unlinkAccount(
        {
          providerId: provider,
        },
        {
          onSuccess: async () => {
            toast.success(`Account unlinked successfully`);
            router.push("/dashboard/profile/edit");
          },
          onError: async (context) => {
            toast.error(context.error.message);
          },
        }
      );
    } catch (err) {
      toast.error(`Failed to unlink ${label}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (provider: string) => {
    try {
      setLoading(true);
      await authClient.linkSocial(
        {
          provider: provider === "google" ? "google" : "github",
          callbackURL: "/dashboard/profile/edit",
        },
        {
          onSuccess: async () => {
            toast.success(
              <span>
                <strong className="capitalize">{provider}</strong> Account
                Linked Successfully!
              </span>
            );
          },
          onError: async (context) => {
            toast.error(context.error.message);
          },
        }
      );
    } catch (err) {
      toast.error(`Failed to link ${label}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`${bg} shadow-md rounded-2xl`}>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">OAuth Provider</CardTitle>
        {provider && accountId ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleUnlink(provider)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlink"}
          </Button>
        ) : (
          <>
            {providers && (
              <div className="flex gap-3">
                {providers[0] && (
                  <Button
                    onClick={() => handleLink("google")}
                    disabled={loading}
                    className="flex items-center gap-2"
                    variant="defaultWhite"
                  >
                    {loading ? (
                      <SharedMiniLoader />
                    ) : (
                      <FaGoogle className="text-red-500" />
                    )}
                    Link Google
                  </Button>
                )}

                {providers[1] && (
                  <Button
                    onClick={() => handleLink("github")}
                    disabled={loading}
                    className="flex items-center gap-2"
                    variant="defaultWhite"
                  >
                    {loading ? (
                      <SharedMiniLoader />
                    ) : (
                      <FaGithub className="text-gray-800" />
                    )}
                    Link GitHub
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardHeader>
      <CardContent>
        {provider ? (
          <div
            className={`uppercase flex items-center gap-2 font-medium ${text}`}
          >
            {icon}
            {label}
          </div>
        ) : (
          <div className="text-muted-foreground italic">No provider linked</div>
        )}
      </CardContent>
    </Card>
  );
}
