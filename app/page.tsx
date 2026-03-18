import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HomeHero from "@/components/HomeHero";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return <HomeHero />;
  }

  let redirectPath = "/menu";

  try {
    // Check if user exists in our database
    const dbUser = await prisma.users.findUnique({
      where: { id: user.id },
    });

    // If user doesn't exist or name/employee_id is missing, go to profile completion
    if (!dbUser || !dbUser.name || !dbUser.employee_id) {
      redirectPath = "/complete-profile";
    } else {
      redirectPath = "/menu";
    }
  } catch (error) {
    console.error("Database connection error:", error);
  }

  return redirect(redirectPath);
}
