import { SignupForm } from "@/components/auth-forms";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return <SignupForm configured={isSupabaseConfigured()} />;
}
