import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CandidateRegistrationView from "@/components/CandidateRegistrationView";
import Header from "@/components/Header";

export default async function RegisterCandidatePage() {
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

  const initialEmployee = employee ? {
    emp_id: employee.emp_id,
    title: employee.title,
    name: employee.name,
    surname: employee.surname,
    site: employee.site,
  } : null;

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 pt-10">
        <Header user={sanitizedUser} />
        <div className="mt-16 relative z-10">
          <CandidateRegistrationView 
            initialEmployee={initialEmployee} 
            userImageUrl={sanitizedUser.imageUrl}
          />
        </div>
      </div>
    </main>
  );
}
