"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Swal from "sweetalert2";

export default function CompleteProfile() {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !employeeId) return;

    if (employeeId.length !== 6 || !/^\d+$/.test(employeeId)) {
      Swal.fire({
        title: "ข้อมูลไม่ถูกต้อง",
        text: "รหัสพนักงานต้องเป็นตัวเลข 6 หลักเท่านั้น",
        icon: "warning",
        confirmButtonColor: "#4B39EF",
        background: "rgba(24, 24, 27, 0.95)",
        color: "#ffffff",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, employeeId }),
      });

      if (response.ok) {
        Swal.fire({
          title: "บันทึกข้อมูลสำเร็จ!",
          text: "กำลังพาคุณไปยังหน้าลงคะแนน",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "rgba(24, 24, 27, 0.95)",
          color: "#ffffff",
        });
        setTimeout(() => router.push("/vote"), 1500);
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonColor: "#4B39EF",
          background: "rgba(24, 24, 27, 0.95)",
          color: "#ffffff",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่อของคุณ",
        icon: "error",
        confirmButtonColor: "#4B39EF",
        background: "rgba(24, 24, 27, 0.95)",
        color: "#ffffff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return (
    <div className="flex min-h-screen items-center justify-center p-4">
       <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <p className="text-white font-black">กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ</p>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-10 bg-white/10 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]" />

        <div className="text-center relative z-10">
          <h2 className="text-4xl font-black text-white tracking-tight uppercase mb-4">
            ข้อมูลส่วนตัว
          </h2>
          <div className="h-1.5 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-6" />
          <p className="text-lg text-white/70 font-medium leading-relaxed">
            กรุณาระบุชื่อ-นามสกุล และรหัสพนักงาน<br/>เพื่อให้ข้อมูลการลงคะแนนสมบูรณ์
          </p>
        </div>

        <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="firstName" className="block text-xs font-black uppercase tracking-[0.2em] text-indigo-300 ml-2">
                ชื่อจริง (First Name)
              </label>
              <input
                id="firstName"
                type="text"
                required
                className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all hover:border-white/20"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="lastName" className="block text-xs font-black uppercase tracking-[0.2em] text-indigo-300 ml-2">
                นามสกุล (Last Name)
              </label>
              <input
                id="lastName"
                type="text"
                required
                className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all hover:border-white/20"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="employeeId" className="block text-xs font-black uppercase tracking-[0.2em] text-indigo-300 ml-2">
              รหัสพนักงาน (Employee ID - 6 หลัก)
            </label>
            <input
              id="employeeId"
              type="text"
              maxLength={6}
              required
              className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all hover:border-white/20 text-center text-3xl font-black tracking-[0.5em]"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden py-6 px-10 rounded-[2.5rem] bg-gradient-to-r from-indigo-500 via-indigo-600 to-[#4B39EF] text-white font-black text-2xl shadow-[0_20px_80px_rgba(75,57,239,0.4)] hover:shadow-[0_25px_100px_rgba(75,57,239,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale disabled:pointer-events-none"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center gap-4">
                {isLoading ? (
                  <>
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังบันทึกข้อมูล...</span>
                  </>
                ) : (
                  <span className="uppercase tracking-tight">ยืนยันและไปที่หน้าลงคะแนน</span>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
