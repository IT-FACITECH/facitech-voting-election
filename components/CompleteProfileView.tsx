"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Swal from "sweetalert2";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Info, UserCheck, ArrowRight } from "lucide-react";

export default function CompleteProfileView() {
  const { user, isLoaded } = useUser();
  const [employeeId, setEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

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
        body: JSON.stringify({ employeeId }),
      });

      if (response.ok) {
        Swal.fire({
          title: "ยืนยันตัวตนสำเร็จ!",
          text: "ระบบได้เชื่อมข้อมูลพนักงานของคุณเรียบร้อยแล้ว",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "rgba(24, 24, 27, 0.95)",
          color: "#ffffff",
        });
        setTimeout(() => router.push("/menu"), 1500);
      } else {
        const errorText = await response.text();
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: errorText || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
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
      <Card className="w-full max-w-lg border-white/10 bg-zinc-950/50 backdrop-blur-2xl shadow-2xl rounded-[3rem] overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px]" />

        <CardHeader className="text-center pt-12 pb-8 relative z-10 space-y-4">
          <div className="mx-auto w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
            <UserCheck className="w-8 h-8" />
          </div>
          <CardTitle className="text-4xl font-black text-white tracking-tight uppercase">
            ยืนยันตัวตนพนักงาน
          </CardTitle>
          <CardDescription className="text-lg text-white/50 font-medium max-w-xs mx-auto">
            ระบุรหัสพนักงานของคุณเพื่อตรวจสอบและดึงข้อมูลจากระบบ
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 px-8 md:px-12 pb-12">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Label className="block text-xs font-black uppercase tracking-[0.2em] text-indigo-200 text-center">
                รหัสพนักงาน (Employee ID - 6 หลัก)
              </Label>
              <Input
                type="text"
                maxLength={6}
                required
                className="h-20 rounded-[1.5rem] border-white/10 bg-white/5 text-white placeholder:text-white/10 focus-visible:ring-indigo-400 text-center text-4xl font-black tracking-[0.5em]"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-18 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <span className="uppercase tracking-tight">ยืนยันและไปต่อ</span>
                  <ArrowRight className="w-6 h-6 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-white/5 border-t border-white/5 p-6 justify-center">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Info className="w-4 h-4" />
            ตรวจสอบตัวตนของคุณเพื่อใช้สิทธิ์เลือกตั้ง
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
