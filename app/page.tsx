import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/marketing/OnboardingFlow";

export default async function RootPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (session) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
