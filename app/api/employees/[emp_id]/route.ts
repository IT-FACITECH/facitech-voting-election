import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ emp_id: string }> }
) {
  try {
    const { emp_id } = await params;
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get("election_id");

    const employee = await prisma.employees.findUnique({
      where: { emp_id },
    });

    if (!employee) {
      return NextResponse.json({ error: "ไม่พบข้อมูลพนักงาน" }, { status: 404 });
    }

    // 1. Check if already registered for this election (if electionId provided)
    if (electionId) {
      const existingCandidate = await prisma.candidates.findFirst({
        where: {
          election_id: electionId,
          create_by: emp_id,
        },
      });

      if (existingCandidate) {
        return NextResponse.json({ 
          error: "พนักงานท่านนี้ได้ลงทะเบียนเป็นผู้สมัครในการเลือกตั้งนี้แล้ว",
          isEligible: false 
        }, { status: 403 });
      }
    }

    if (!employee.start_date) {
      return NextResponse.json({ error: "ไม่พบข้อมูลวันที่เริ่มงาน" }, { status: 400 });
    }

    const startDate = new Date(employee.start_date);
    const today = new Date();
    
    // Calculate difference in days
    // Use getTime() and divide by milliseconds in a day
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 89) {
      return NextResponse.json({ 
        error: "คุณสมบัติในการสมัครยังไม่เพียงพอ (อายุงานยังไม่ถึง 90 วัน)",
        isEligible: false
      }, { status: 403 });
    }

    return NextResponse.json({
      emp_id: employee.emp_id,
      title: employee.title,
      name: employee.name,
      surname: employee.surname,
      site: employee.site,
      isEligible: true
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
