import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            เลือกตั้งออนไลน์ เพื่อจัดตั้งคณะกรรมการ Facitech
          </h1>
          <p className="max-w-md text-lg text-white/80">
            ยินดีต้อนรับสู่ระบบเลือกตั้งออนไลน์ กรุณาเข้าสู่ระบบเพื่อโหวต
          </p>
          <Link
            href="/sign-in"
            className="rounded-2xl bg-black px-12 py-4 text-lg font-bold text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
          >
            เข้าสู่ระบบด้วย LINE
          </Link>
        </div>
      </div>
    );
  }

  let shouldRedirect = false;
  let redirectPath = "/vote";

  try {
    // Check if user exists in our database
    const dbUser = await prisma.users.findUnique({
      where: { id: user.id },
    });

    // If user doesn't exist or name/employee_id is missing, go to profile completion
    if (!dbUser || !dbUser.name || !dbUser.employee_id) {
      redirectPath = "/complete-profile";
    } else {
      redirectPath = "/vote";
    }
    shouldRedirect = true;
  } catch (error) {
    console.error("Database connection error:", error);
    // Even if DB fails, we still want to redirect
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    return redirect(redirectPath);
  }
}
