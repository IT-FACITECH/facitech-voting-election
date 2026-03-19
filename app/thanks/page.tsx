import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ThankYouView from "@/components/ThankYouView";

export default async function ThanksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch dbUser to get employee_id
  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
  });

  // Fetch employee details for personalized message
  const employee = dbUser?.employee_id ? await prisma.employees.findUnique({
    where: { emp_id: dbUser.employee_id },
  }) : null;

  return (
    <ThankYouView 
      name={employee?.name || dbUser?.name || "Voter"} 
      surname={employee?.surname || ""} 
    />
  );
}
