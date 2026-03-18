import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { firstName, lastName, employeeId } = await req.json();

  if (!firstName || !lastName || !employeeId) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  try {
    const updatedUser = await prisma.users.upsert({
      where: { id: userId },
      update: {
        name: `${firstName} ${lastName}`,
        employee_id: employeeId,
        email: user.emailAddresses[0]?.emailAddress,
      },
      create: {
        id: userId,
        name: `${firstName} ${lastName}`,
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
