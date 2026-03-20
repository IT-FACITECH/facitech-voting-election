"use client";

import VotingForm from "@/components/VotingForm";
import NoElection from "@/components/NoElection";
import ThankYou from "@/components/ThankYou";

interface Candidate {
  id: string;
  number: number;
  name: string;
  bio?: string | null;
  image_url?: string | null;
  site?: string | null;
}

interface Election {
  id: string;
  title: string;
  description: string | null;
  candidates: Candidate[];
}

interface VotingContentProps {
  userId: string;
  initialElection: Election | null;
  initialHasVoted: boolean;
}

export default function VotingContent({ initialElection, initialHasVoted }: VotingContentProps) {
  if (initialHasVoted) {
    return <ThankYou />;
  }

  if (!initialElection) {
    return <NoElection />;
  }

  if (initialElection.candidates.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] text-center border border-white/20">
         <p className="text-white text-xl">ยังไม่มีผู้สมัครในการเลือกตั้ง {initialElection.title}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
      <h2 className="text-3xl font-black mb-2 text-white tracking-tight">{initialElection.title}</h2>
      <p className="text-white/70 mb-10 text-lg">
        {initialElection.description}
      </p>

      <VotingForm electionId={initialElection.id} candidates={initialElection.candidates} />
    </div>
  );
}
