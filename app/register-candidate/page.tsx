import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CandidateRegistrationView from "@/components/CandidateRegistrationView";
import Header from "@/components/Header";

export default async function CandidateRegistrationPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  // Fetch dbUser to get employee_id
  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
  });

  const employee = dbUser?.employee_id ? await prisma.employees.findUnique({
    where: { emp_id: dbUser.employee_id },
  }) : null;

  const sanitizedUser = {
    firstName: user.firstName,
    username: user.username,
    name: employee?.name,
    surname: employee?.surname,
    imageUrl: user.imageUrl,
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Header user={sanitizedUser} />
        <CandidateRegistrationView />
      </div>
    </div>
  );
}
