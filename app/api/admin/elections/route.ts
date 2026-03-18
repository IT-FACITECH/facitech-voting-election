import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const elections = await prisma.elections.findMany({
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: { candidates: true, votes: true }
        }
      }
    });
    return NextResponse.json(elections);
  } catch (error) {
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
        reg_start_date: new Date(reg_start_date),
        reg_end_date: new Date(reg_end_date),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        is_active: true,
      },
    });

    return NextResponse.json(election);
  } catch (error) {
    console.error(error);
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
        reg_start_date: new Date(reg_start_date),
        reg_end_date: new Date(reg_end_date),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        is_active,
      },
    });

    return NextResponse.json(election);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update election" }, { status: 500 });
  }
}
