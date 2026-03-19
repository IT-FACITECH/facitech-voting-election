import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get employee id using userId (from clerk)
    // Assuming employees table has user_id or similar.
    // In this app, we are using clerk.
    // Let's find the employee associated with this clerk user.
    // Based on register page: it's fetched via prisma.employees.findUnique({ where: { user_id: userId }})
    
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user || !user.employee_id) {
      return NextResponse.json([]);
    }

    const registrations = await prisma.candidates.findMany({
      where: {
        create_by: user.employee_id
      },
      select: {
        election_id: true
      }
    });

    return NextResponse.json(registrations.map((r: { election_id: string | null }) => r.election_id));
  } catch (error) {
    console.error("Failed to fetch registrations", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
