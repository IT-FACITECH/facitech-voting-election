import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import VoteView from "@/components/VoteView";

export default async function VotePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  // Check if user has completed their profile
  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!dbUser || !dbUser.employee_id || !dbUser.name) {
    redirect("/complete-profile");
  }

  const employee = await prisma.employees.findUnique({
    where: { emp_id: dbUser.employee_id },
  });

  const sanitizedUser = {
    firstName: user.firstName,
    username: user.username,
    name: employee?.name,
    surname: employee?.surname,
    imageUrl: user.imageUrl,
  };

  return <VoteView user={sanitizedUser} userId={userId} />;
}
