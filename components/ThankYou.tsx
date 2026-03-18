"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ThankYou() {
  return (
    <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[2.5rem] text-center border border-white/20 shadow-2xl">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-8 border border-emerald-500/30">
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      </div>
      
      <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">ขอบคุณสำหรับการลงคะแนน</h2>
      <p className="text-white/60 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
        คะแนนเสียงของคุณถูกบันทึกเข้าระบบเรียบร้อยแล้ว ขอบคุณที่ร่วมเป็นส่วนหนึ่งในการขับเคลื่อนองค์กร
      </p>
      
      <div className="flex justify-center">
        <Link 
          href="/menu"
          className="group flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-black font-black text-lg hover:bg-white/90 transition-all active:scale-95 shadow-[0_15px_40px_rgba(255,255,255,0.2)]"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          กลับสู่หน้าเมนูหลัก
        </Link>
      </div>

      <p className="mt-8 text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
        Success: Your vote has been recorded
      </p>
    </div>
  );
}
