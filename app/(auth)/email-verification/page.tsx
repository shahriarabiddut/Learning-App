import SendVerificationEmail from "@/components/auth/send-verify-email";
import { EmailSchema } from "@/schemas/authSchema";
import { redirect } from "next/navigation";

export default async function EmailVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}) {
  const email = (await searchParams)?.email || "";
  const isValidEmail = EmailSchema.safeParse({ email });
  if (!email || !isValidEmail.success) {
    redirect("/sign-in");
  }
  return (
    <>
      <SendVerificationEmail email={email} />
    </>
  );
}
