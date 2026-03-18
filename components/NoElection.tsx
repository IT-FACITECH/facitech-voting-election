import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NoElection() {
  return (
    <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[2.5rem] text-center border border-white/20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/20 mb-6">
        <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">ไม่มีรายการการเลือกตั้งที่กำลังดำเนินการ</h2>
      <p className="text-white/60 font-medium max-w-sm mx-auto mb-8">ในขณะนี้ยังไม่มีการเปิดรับคะแนนโหวต หรือคุณอาจได้ใช้สิทธิ์ในทุกรายการที่เปิดอยู่แล้ว</p>
      
      <Link 
        href="/menu"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black hover:bg-white/90 transition-all active:scale-95 shadow-xl"
      >
        <ArrowLeft className="w-5 h-5" />
        กลับสู่เมนูหลัก
      </Link>
    </div>
  );
}
