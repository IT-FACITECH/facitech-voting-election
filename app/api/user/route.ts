import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { employeeId } = await req.json();

  if (!employeeId) {
    return new NextResponse("Missing employee ID", { status: 400 });
  }

  try {
    // 1. Check if employee exists in the employees table
    const employee = await prisma.employees.findUnique({
      where: { emp_id: employeeId },
    });

    if (!employee) {
      return new NextResponse("ไม่พบรหัสพนักงานในระบบ กรุณาตรวจสอบอีกครั้ง", { status: 404 });
    }

    // 2. Combine title, name, and surname (if available)
    const fullName = [employee.title, employee.name, employee.surname]
      .filter(Boolean)
      .join(" ")
      .trim();

    // 3. Update or create the user profile
    const updatedUser = await prisma.users.upsert({
      where: { id: userId },
      update: {
        name: fullName,
        employee_id: employeeId,
        email: user.emailAddresses[0]?.emailAddress,
      },
      create: {
        id: userId,
        name: fullName,
        employee_id: employeeId,
        email: user.emailAddresses[0]?.emailAddress,
        line_user_id: user.externalAccounts.find(acc => acc.provider === "oauth_line")?.externalId,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
