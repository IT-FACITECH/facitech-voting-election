"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  user: {
    firstName?: string | null;
    username?: string | null;
    imageUrl: string;
  };
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const isMenuPage = pathname === "/menu";

  return (
    <header className="flex justify-between items-center w-full">
      <div className="flex items-center gap-6">
        {!isMenuPage && (
          <Link 
            href="/menu" 
            className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-lg"
            title="กลับสู่เมนูหลัก"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
        )}
        <div>
          <h1 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase">
            ระบบเลือกตั้งภายใน Facitech
          </h1>
          <p className="text-white/40 font-bold text-xs md:text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ยินดีต้อนรับ, {user.firstName || user.username || 'Voter'}
          </p>
        </div>
      </div>
      
      <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-white/10 hover:border-indigo-500/50 transition-colors shadow-2xl group cursor-pointer relative">
        <Image 
          src={user.imageUrl} 
          alt="Profile" 
          width={48} 
          height={48} 
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-indigo-500/10 group-hover:bg-transparent transition-colors" />
      </div>
    </header>
  );
}
