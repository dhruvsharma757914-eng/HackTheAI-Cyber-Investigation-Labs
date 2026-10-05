import { redirect } from "next/navigation";
import { getCurrentUser, isGuestUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign in // VT-SOC" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  // Anonymous guests still see this page so they can opt into a saved account.
  if (user && !isGuestUser(user)) redirect("/");

  return <AuthForm mode="login" />;
}
