import { Suspense } from "react";
import Header from "@/components/Header";
import VotingContent from "@/components/VotingContent";

interface VoteViewProps {
  user: {
    firstName?: string | null;
    username?: string | null;
    name?: string | null;
    surname?: string | null;
    imageUrl: string;
  };
  userId: string;
}

export default function VoteView({ user, userId }: VoteViewProps) {
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
