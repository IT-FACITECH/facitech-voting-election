import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const electionId = searchParams.get("electionId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // 1. Find the election
    let election;
    if (electionId) {
      // Find specific election
      election = await prisma.elections.findUnique({
        where: { id: electionId },
        include: {
          candidates: {
            orderBy: { number: "asc" },
          },
        },
      });
    } else {
      // Find first active election
      election = await prisma.elections.findFirst({
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
    }

    if (!election) {
      return NextResponse.json({ error: "ไม่พบรายการการเลือกตั้งที่กำลังดำเนินการ" }, { status: 404 });
    }

    // 2. Check if user has already voted in THIS specific election
    const existingVote = await prisma.votes.findFirst({
      where: {
        election_id: election.id,
        voter_id: userId,
      },
    });

    if (existingVote) {
      return NextResponse.json({ hasVoted: true });
    }

    return NextResponse.json({ election, hasVoted: false });
  } catch (error) {
    console.error("API Vote Content Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
