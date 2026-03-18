import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CandidateRegistrationView from "@/components/CandidateRegistrationView";
import Header from "@/components/Header";

export default async function CandidateRegistrationPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Header user={user} />
        <CandidateRegistrationView />
      </div>
    </div>
  );
}
