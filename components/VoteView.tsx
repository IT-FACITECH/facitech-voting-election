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
  election: any;
  hasVoted: boolean;
}

export default function VoteView({ user, userId, election, hasVoted }: VoteViewProps) {
  return (
    <div className="min-h-screen p-4 md:p-8 pb-40 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Header user={user} />

        <VotingContent 
          userId={userId} 
          initialElection={election} 
          initialHasVoted={hasVoted} 
        />
      </div>
    </div>
  );
}
