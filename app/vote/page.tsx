import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import VotingForm from "@/components/VotingForm";
import Header from "@/components/Header";
import NoElection from "@/components/NoElection";
import ThankYou from "@/components/ThankYou";

async function VotingContent({ userId }: { userId: string }) {
  // Get current active election
  const now = new Date();
  const election = await prisma.elections.findFirst({
    where: {
      is_active: true,
      start_date: { lte: now },
      end_date: { gte: now },
    },
    include: {
      candidates: {
        orderBy: { number: "asc" },
      },
    },
  });

  if (!election) {
    return <NoElection />;
  }

  // Check if user has already voted
  const existingVote = await prisma.votes.findFirst({
    where: {
      election_id: election.id,
      voter_id: userId,
    },
  });

  if (existingVote) {
    return <ThankYou />;
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
      <h2 className="text-3xl font-black mb-2 text-white tracking-tight">{election.title}</h2>
      <p className="text-white/70 mb-10 text-lg">
        {election.description}
      </p>

      <VotingForm electionId={election.id} candidates={election.candidates} />
    </div>
  );
}

export default async function VotePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  // Check if user has completed their profile
  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!dbUser || !dbUser.employee_id || !dbUser.name) {
    redirect("/complete-profile");
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-40 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Header user={user} />

        <Suspense
          fallback={
            <div className="bg-white/10 backdrop-blur-md p-12 rounded-2xl text-center border border-white/20">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <p className="text-white">กำลังโหลดข้อมูลการเลือกตั้ง...</p>
            </div>
          }
        >
          <VotingContent userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}

