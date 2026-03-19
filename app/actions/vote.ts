"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function castVote(formData: {
  electionId: string;
  candidateIds: string[];
}) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  // Fetch the user from our database to get employee_id and name
  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!dbUser || !dbUser.employee_id || !dbUser.name) {
    throw new Error("กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วนก่อนลงคะแนน");
  }

  const { electionId, candidateIds } = formData;

  // Split name back to first/last for the votes table if needed, 
  // though votes table has first_name and last_name fields.
  const nameParts = dbUser.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // 1. Basic validation
  if (!electionId || !candidateIds) {
    throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  // Ensure exactly 5 candidates are selected and they are unique
  const uniqueCandidateIds = Array.from(new Set(candidateIds));
  if (uniqueCandidateIds.length !== 5 || candidateIds.length !== 5) {
    throw new Error("กรุณาเลือกผู้สมัครให้ครบ 5 ท่าน และห้ามเลือกซ้ำ");
  }

  // 2. Check if the election is still active and within dates
  const election = await prisma.elections.findUnique({
    where: { id: electionId },
    include: { candidates: true }
  });

  if (!election || !election.is_active) {
    throw new Error("การเลือกตั้งไม่ได้เปิดใช้งาน");
  }

  // Check if all selected candidate IDs belong to this election
  const electionCandidateIds = election.candidates.map((c: { id: string }) => c.id);
  const allBelong = uniqueCandidateIds.every((id: string) => electionCandidateIds.includes(id));
  if (!allBelong) {
    throw new Error("ผู้สมัครบางท่านไม่ได้อยู่ในรายการของการเลือกตั้งนี้");
  }

  const now = new Date();
  if (now < election.start_date || now > election.end_date) {
    throw new Error("ช่วงเวลาการโหวตปิดอยู่");
  }

  // 3. Check if the user has already voted in this election
  const existingVote = await prisma.votes.findFirst({
    where: {
      election_id: electionId,
      voter_id: userId,
    },
  });

  if (existingVote) {
    return { error: "คุณได้ใช้สิทธิ์ลงคะแนนไปแล้ว" };
  }

  try {
    // 3. Record all 5 votes in a transaction
    await prisma.$transaction([
      // Create a vote record for each candidate
      ...candidateIds.map((candidateId: string) => 
        prisma.votes.create({
          data: {
            election_id: electionId,
            candidate_id: candidateId,
            voter_id: userId,
            first_name: firstName,
            last_name: lastName,
            employee_id: dbUser.employee_id,
          },
        })
      ),
    ]);

    revalidatePath("/vote");
    return { success: true };
  } catch (error) {
    console.error("Error casting vote:", error);
    throw new Error("Failed to cast vote");
  }
}
