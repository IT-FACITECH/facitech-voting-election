"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function VotingContent({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const electionId = searchParams.get("id");
  
  const [election, setElection] = useState<Election | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/vote/content?userId=${userId}${electionId ? `&electionId=${electionId}` : ""}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
        }

        if (data.hasVoted) {
          setHasVoted(true);
        } else {
          setElection(data.election);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, electionId]);

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md p-12 rounded-2xl text-center border border-white/20">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <p className="text-white">กำลังโหลดข้อมูลการเลือกตั้ง...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 backdrop-blur-xl p-10 rounded-[2.5rem] text-center border border-red-500/20">
        <p className="text-red-400 font-bold">{error}</p>
      </div>
    );
  }

  if (hasVoted) {
    return <ThankYou />;
  }

  if (!election) {
    return <NoElection />;
  }

  if (election.candidates.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] text-center border border-white/20">
         <p className="text-white text-xl">ยังไม่มีผู้สมัครในการเลือกตั้ง "{election.title}"</p>
      </div>
    );
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
