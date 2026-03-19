import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ElectionManagementView from "@/components/ElectionManagementView";
import Header from "@/components/Header";

export default async function AdminElectionsPage() {
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

  // ดึงข้อมูลพนักงานเพื่อเช็คตำแหน่ง (Security Check)
  const employee = await prisma.employees.findUnique({
    where: { emp_id: dbUser.employee_id },
  });

  const allowedPositions = [
    "Managing Director",
    "IT Solution Engineer",
    "Senior HR Generalist",
    "Operation Director"
  ];

  if (!employee || !allowedPositions.includes(employee.position || "")) {
    redirect("/menu");
  }

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
        <div className="mt-10">
          <ElectionManagementView />
        </div>
      </div>
    </div>
  );
}
