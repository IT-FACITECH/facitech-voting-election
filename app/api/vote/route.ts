import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { electionId, candidateIds } = await req.json();

  if (!electionId || !candidateIds || candidateIds.length !== 5) {
    return new NextResponse("Missing fields or incorrect number of candidates", { status: 400 });
  }

  // Fetch user info from database
  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!dbUser || !dbUser.employee_id || !dbUser.name) {
    return new NextResponse("User profile incomplete", { status: 400 });
  }

  const nameParts = dbUser.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  try {
    // Check if the user has already voted for this election
    const existingVote = await prisma.votes.findFirst({
      where: {
        election_id: electionId,
        voter_id: userId,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already cast your vote for this election." },
        { status: 400 }
      );
    }

    // Create the votes for all 5 candidates in a single batch
    await prisma.votes.createMany({
      data: candidateIds.map((candidateId: string) => ({
        election_id: electionId,
        candidate_id: candidateId,
        voter_id: userId,
        first_name: firstName,
        last_name: lastName,
        employee_id: dbUser.employee_id,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error casting vote:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
