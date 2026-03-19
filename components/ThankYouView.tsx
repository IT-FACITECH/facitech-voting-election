"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { CheckCircle2, Home, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ThankYouViewProps {
  name: string;
  surname: string;
}

export default function ThankYouView({ name, surname }: ThankYouViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0c] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />

      <Card className="w-full max-w-2xl border-white/10 bg-zinc-950/40 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-[3rem] overflow-hidden relative z-10 border-t-white/10">
        <CardContent className="p-10 md:p-16 flex flex-col items-center text-center space-y-10">
          
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-ping" />
            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border-4 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
              ลงคะแนนเรียบร้อย!
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 font-bold max-w-md mx-auto leading-relaxed">
              ขอบคุณสำหรับความร่วมมือ <br />
              <span className="text-indigo-300">คุณ {name} {surname}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-indigo-300 font-black text-xs uppercase tracking-[0.3em] bg-indigo-500/10 px-6 py-2.5 rounded-full border border-indigo-500/20 shadow-lg">
            <Heart className="w-4 h-4 fill-indigo-400" />
            คะแนนของคุณถูกบันทึกสำเร็จ
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-6">
            <Button asChild className="h-16 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black text-lg transition-all shadow-xl active:scale-95 group border-none">
              <Link href="/menu">
                <Home className="w-5 h-5 mr-3 group-hover:-translate-y-1 transition-transform" />
                กลับสู่หน้าหลัก
              </Link>
            </Button>
            
            <SignOutButton redirectUrl="/sign-in">
              <Button variant="outline" className="h-16 rounded-2xl bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-black text-lg transition-all shadow-xl active:scale-95 group border-none">
                <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                ออกจากระบบ
              </Button>
            </SignOutButton>
          </div>

          <div className="pt-6">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">
              Facitech Election Management System &copy; 2026
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
