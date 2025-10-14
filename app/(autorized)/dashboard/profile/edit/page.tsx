import AccountDeleteEmail from "@/components/profile/AccountDeleteEmail";
import Enable2FA from "@/components/profile/Enable2FA";
import ProviderDetails from "@/components/profile/ProviderDetails";
import UpdateEmailForm from "@/components/profile/UpdateEmailForm";
import UpdatePasswordForm from "@/components/profile/UpdatePasswordForm";
import UpdateUserForm from "@/components/profile/UpdateUserForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getServerSession } from "@/lib/better-auth-client-and-actions/authAction";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { NEXT_PUBLIC_GOOGLE, NEXT_PUBLIC_GITHUB } from "@/lib/constants/env";

const EditProfile = async () => {
  const session = await getServerSession();
  const { user } = session;
  // const isDemoUser = user.demo === true || user.demo === undefined;
  const isDemoUser = user?.demo === true;

  // Get The Provider
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  // Find specific accounts by provider
  const credentialAccount = accounts.find(
    (acc) => acc.provider === "credential"
  );
  const oAuthAccount = accounts.find((acc) => acc.provider !== "credential");

  const credentialProvider = credentialAccount?.provider;
  const oAuthProvider = oAuthAccount?.provider || null;

  return (
    <section className="space-y-0.5 pt-5 pb-10">
      {isDemoUser && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4 mx-4 text-center">
          This is a demo account. Profile editing and security settings are
          disabled.
        </div>
      )}

      {!credentialProvider ? (
        <>
          <div className="p-4 pt-6 md:px-8 md:py-2">
            <ProviderDetails provider={oAuthProvider} />
          </div>

          <div
            className={`p-4 pt-6 md:px-8 md:py-2 ${
              isDemoUser ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <Tabs defaultValue="profile" className="w-full space-y-4">
              <TabsList className="grid w-full grid-cols-2 gap-1 cursor-pointer">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="delete">Delete</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <UpdateUserForm user={user} />
              </TabsContent>
              <TabsContent value="delete">
                <AccountDeleteEmail />
              </TabsContent>
            </Tabs>
          </div>
        </>
      ) : (
        <>
          <div
            className={`p-4 pt-6 md:px-8 md:py-2 min-h-[50vh] ${
              isDemoUser ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <Tabs defaultValue="profile" className="w-full space-y-4">
              <TabsList className="grid w-full grid-cols-4 gap-1 cursor-pointer">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="delete">Delete</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <UpdateUserForm user={user} />
              </TabsContent>
              <TabsContent value="email">
                <UpdateEmailForm user={user} />
              </TabsContent>
              <TabsContent value="password">
                <UpdatePasswordForm user={user} />
              </TabsContent>
              <TabsContent value="delete">
                <AccountDeleteEmail />
              </TabsContent>
            </Tabs>
          </div>

          <div
            className={`p-4 pt-6 md:px-8 md:py-2 ${
              isDemoUser ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <Enable2FA session={session} />
          </div>

          <div className="p-4 pt-6 md:px-8 md:py-2">
            <ProviderDetails
              provider={oAuthProvider}
              accountId={user.id}
              providers={[NEXT_PUBLIC_GOOGLE, NEXT_PUBLIC_GITHUB]}
            />
          </div>
        </>
      )}
    </section>
  );
};

export default EditProfile;
