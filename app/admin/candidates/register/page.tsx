import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CandidateRegistrationView from "@/components/CandidateRegistrationView";
import Header from "@/components/Header";

export default async function RegisterCandidatePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  const sanitizedUser = {
    firstName: user.firstName,
    username: user.username,
    imageUrl: user.imageUrl,
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 pt-10">
        <Header user={sanitizedUser} />
        <div className="mt-16 relative z-10">
          <CandidateRegistrationView />
        </div>
      </div>
    </main>
  );
}
