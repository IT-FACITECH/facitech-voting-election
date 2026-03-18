"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Info, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";

interface Employee {
  emp_id: string;
  title: string;
  name: string;
  surname: string;
  site: string;
  isEligible: boolean;
}

interface Election {
  id: string;
  title: string;
  is_active: boolean;
  reg_start_date: string;
  reg_end_date: string;
}

export default function CandidateRegistrationView() {
  const [empId, setEmpId] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch("/api/admin/elections");
        const data: Election[] = await res.json();
        const now = new Date();
        const active = data.filter((e) => {
          const regStart = new Date(e.reg_start_date);
          const regEnd = new Date(e.reg_end_date);
          return e.is_active && now >= regStart && now <= regEnd;
        });
        setElections(active);
        if (active.length > 0) setSelectedElection(active[0].id);
      } catch (err) {
        console.error("Failed to fetch elections", err);
      }
    };
    fetchElections();
  }, []);

  const handleSearch = async () => {
    if (!empId.trim()) {
      Swal.fire({
        title: "กรุณากรอกรหัสพนักงาน",
        icon: "warning",
        background: "rgba(24, 24, 27, 0.95)",
        color: "#fff"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setEmployee(null);

    try {
      const res = await fetch(`/api/employees/${empId}`);
      const data = await res.json();

      if (res.ok) {
        setEmployee(data);
      } else {
        setError(data.error);
        Swal.fire({
          title: "ไม่สามารถดำเนินการได้",
          text: data.error,
          icon: res.status === 403 ? "error" : "info",
          background: "rgba(24, 24, 27, 0.95)",
          color: "#fff"
        });
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!employee || !selectedElection) {
       Swal.fire({
        title: "กรุณาเลือกการเลือกตั้ง",
        icon: "warning",
        background: "rgba(24, 24, 27, 0.95)",
        color: "#fff"
      });
      return;
    }

    const result = await Swal.fire({
      title: "ยืนยันการสมัคร?",
      text: `คุณต้องการลงทะเบียน ${employee.name} เป็นผู้สมัครใช่หรือไม่? ระบบจะดึงรูปโปรไฟล์ของคุณเพื่อใช้ในการสมัครด้วย`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      background: "rgba(24, 24, 27, 0.95)",
      color: "#fff",
      confirmButtonColor: "#6366f1"
    });

    if (!result.isConfirmed) return;

    setIsRegistering(true);
    try {
      const res = await fetch("/api/admin/candidates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emp_id: employee.emp_id,
          election_id: selectedElection
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "ลงทะเบียนสำเร็จ!",
          text: "ข้อมูลผู้สมัครและรูปภาพถูกบันทึกเรียบร้อยแล้ว",
          icon: "success",
          background: "rgba(24, 24, 27, 0.95)",
          color: "#fff"
        });
        setEmployee(null);
        setEmpId("");
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: message,
        icon: "error",
        background: "rgba(24, 24, 27, 0.95)",
        color: "#fff"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight">
          ลงทะเบียนผู้สมัครเลือกตั้ง
        </h1>
        <p className="text-white/60 font-medium">กรอกรหัสพนักงานเพื่อตรวจสอบคุณสมบัติและลงทะเบียน</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-indigo-500/20">
              <UserPlus className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                ข้อมูลการสมัคร
              </h2>
              <p className="text-white/40 text-sm font-medium">เลือกการเลือกตั้งและตรวจสอบรหัสพนักงาน</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1">เลือกการเลือกตั้ง</label>
              <div className="relative">
                <select
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none transition-all appearance-none font-bold"
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                >
                  {elections.length > 0 ? (
                    elections.map((election) => (
                      <option key={election.id} value={election.id} className="bg-zinc-900">
                        {election.title}
                      </option>
                    ))
                  ) : (
                    <option value="" className="bg-zinc-900">ไม่มีการเลือกตั้งที่เปิดอยู่</option>
                  )}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1">รหัสพนักงาน</label>
              <div className="flex gap-4">
                <input
                  className="flex-grow px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-white/20 text-xl font-bold"
                  placeholder="เช่น 123456"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-8 rounded-2xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>ตรวจสอบ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-4 p-5 bg-red-500/20 border border-red-500/40 rounded-2xl text-white shadow-xl shadow-red-500/10 animate-in shake duration-500">
                <div className="p-2 rounded-xl bg-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-200" />
                </div>
                <p className="text-base font-black tracking-tight leading-tight">{error}</p>
              </div>
            )}

            {employee && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400 mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-black text-lg uppercase tracking-wider">ตรวจสอบคุณสมบัติสำเร็จ</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white/30 uppercase tracking-widest">รหัสพนักงาน</p>
                      <p className="text-white font-bold text-lg">{employee.emp_id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white/30 uppercase tracking-widest">คำนำหน้า</p>
                      <p className="text-white font-bold text-lg">{employee.title || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white/30 uppercase tracking-widest">ชื่อ - นามสกุล</p>
                      <p className="text-white font-bold text-lg">{employee.name} {employee.surname}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white/30 uppercase tracking-widest">หน่วยงาน/ไซต์</p>
                      <p className="text-white font-bold text-lg">{employee.site}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    disabled={isRegistering}
                    className="flex-grow py-5 px-8 rounded-2xl bg-white text-black font-black text-lg hover:bg-white/90 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl disabled:opacity-50"
                    onClick={handleRegister}
                  >
                    {isRegistering ? (
                      <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-6 h-6" />
                        <span>ดำเนินการสมัคร</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    disabled={isRegistering}
                    className="px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                    onClick={() => {
                      setEmployee(null);
                      setEmpId("");
                    }}
                  >
                    ล้างค่า
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
