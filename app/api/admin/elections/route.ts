import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const elections = await prisma.elections.findMany({
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: { candidates: true }
        }
      }
    });

    const electionsWithVoters = await Promise.all(
      elections.map(async (e: { id: string; _count?: any }) => {
        const uniqueVoters = await prisma.votes.findMany({
          where: { election_id: e.id },
          distinct: ["voter_id"],
          select: { voter_id: true }
        });
        const voterCount = uniqueVoters.length;
        return {
          ...e,
          _count: {
            ...e._count,
            votes: voterCount // Replacing 'votes' with 'voterCount' to avoid frontend interface changes
          }
        };
      })
    );
    return NextResponse.json(electionsWithVoters);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch elections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, reg_start_date, reg_end_date, start_date, end_date } = body;

    const election = await prisma.elections.create({
      data: {
        title,
        description,
        reg_start_date: new Date(reg_start_date + "+07:00"),
        reg_end_date: new Date(reg_end_date + "+07:00"),
        start_date: new Date(start_date + "+07:00"),
        end_date: new Date(end_date + "+07:00"),
        is_active: true,
      },
    });

    return NextResponse.json(election);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create election" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, title, description, reg_start_date, reg_end_date, start_date, end_date, is_active } = body;

    // Check if voting has ended
    const existing = await prisma.elections.findUnique({ where: { id } });
    if (existing && new Date() > new Date(existing.end_date)) {
      return NextResponse.json({ error: "Cannot edit an ended election" }, { status: 403 });
    }

    const election = await prisma.elections.update({
      where: { id },
      data: {
        title,
        description,
        reg_start_date: new Date(reg_start_date + "+07:00"),
        reg_end_date: new Date(reg_end_date + "+07:00"),
        start_date: new Date(start_date + "+07:00"),
        end_date: new Date(end_date + "+07:00"),
        is_active,
      },
    });

    return NextResponse.json(election);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update election" }, { status: 500 });
  }
}
