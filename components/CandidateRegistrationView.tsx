"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, Info, Search, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface Employee {
  emp_id: string;
  title: string | null;
  name: string | null;
  surname: string | null;
  site: string | null;
}

interface Election {
  id: string;
  title: string;
  is_active: boolean;
  reg_start_date: string;
  reg_end_date: string;
}

interface CandidateRegistrationViewProps {
  initialEmployee?: Employee | null;
  userImageUrl?: string | null;
  initialElections?: Election[];
  initialRegisteredIds?: string[];
}

export default function CandidateRegistrationView({ 
  initialEmployee, 
  userImageUrl,
  initialElections = [],
  initialRegisteredIds = []
}: CandidateRegistrationViewProps) {
  const [employee] = useState<Employee | null>(initialEmployee || null);
  const [elections, setElections] = useState<Election[]>(initialElections);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAgreedIntent, setIsAgreedIntent] = useState(false);
  const [isAgreedCert, setIsAgreedCert] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [registeredElectionIds, setRegisteredElectionIds] = useState<string[]>(initialRegisteredIds);
  const [error, setError] = useState<string | null>(null);

  const fetchElections = async () => {
    try {
      const [electionsRes, regsRes] = await Promise.all([
        fetch("/api/admin/elections"),
        fetch("/api/candidates/my-registrations")
      ]);

      const electionsData: Election[] = await electionsRes.json();
      const regsData: string[] = await regsRes.json();

      const now = new Date();
      const active = electionsData.filter((e) => {
        const regStart = new Date(e.reg_start_date);
        const regEnd = new Date(e.reg_end_date);
        return e.is_active && now >= regStart && now <= regEnd;
      });

      setElections(active);
      if (Array.isArray(regsData)) {
        setRegisteredElectionIds(regsData);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    if (initialElections.length === 0) {
      fetchElections();
    }
  }, [initialElections]);

  const handleRegister = async () => {
    if (!employee || !selectedElection) return;

    setIsRegistering(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/candidates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emp_id: employee.emp_id,
          election_id: selectedElection.id
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSelectedElection(null); // Close the dialog
        fetchElections(); // Refresh registration list immediately
        
        Swal.fire({
          title: "ลงทะเบียนสำเร็จ!",
          text: "ข้อมูลผู้สมัครและรูปภาพถูกบันทึกเรียบร้อยแล้ว",
          icon: "success",
          background: "rgba(24, 24, 27, 0.95)",
          color: "#fff"
        });
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      setError(message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto space-y-12 pb-20 pt-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight sm:text-5xl uppercase">
          CANDIDATE <span className="text-indigo-400">REGISTRATION</span>
        </h1>
        <p className="text-zinc-300 font-medium max-w-lg mx-auto">ลงทะเบียนผู้สมัครเลือกตั้ง ตรวจสอบคุณสมบัติและบันทึกข้อมูลเข้าระบบ</p>
      </div>

      <Card className="border-white/5 bg-zinc-950/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-wider text-white">ข้อมูลการสมัคร</CardTitle>
              <CardDescription className="text-zinc-400 font-medium">รายละเอียดผู้สมัครและการเลือกตั้งที่เปิดรับ</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-10 space-y-8">
          {!employee && (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-700">
                <Search className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">กำลังตรวจสอบข้อมูลพนักงาน...</h3>
                <p className="text-zinc-500 font-medium">กรุณารอสักครู่ ระบบกำลังดึงข้อมูลพนักงานของคุณ</p>
              </div>
            </div>
          )}

          {employee && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-white/10" />
                  <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.5em]">รายการการเลือกตั้งที่เปิดรับ</h3>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {elections.length > 0 ? (
                    elections.map((election) => (
                      <Card key={election.id} className="bg-white/5 border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h4 className="text-white font-black text-lg group-hover:text-indigo-300 transition-colors uppercase leading-tight">{election.title}</h4>
                              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Election Registration Open</p>
                            </div>
                            {registeredElectionIds.includes(election.id) && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black text-[10px] px-2 py-0.5 whitespace-nowrap">ลงทะเบียนแล้ว</Badge>
                            )}
                          </div>
                          
                          <Button
                            disabled={isRegistering || registeredElectionIds.includes(election.id)}
                            onClick={() => {
                              setSelectedElection(election);
                              setIsAgreedIntent(false);
                              setIsAgreedCert(false);
                              setError(null);
                            }}
                            className={`w-full h-12 rounded-xl font-black text-sm transition-all active:scale-95 ${
                              registeredElectionIds.includes(election.id)
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5 opacity-50"
                                : "bg-white text-black hover:bg-zinc-200"
                            }`}
                          >
                            {registeredElectionIds.includes(election.id) ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                ลงทะเบียนสำเร็จ
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                ลงสมัครการเลือกตั้ง
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">ขณะนี้ไม่มีการเลือกตั้งที่เปิดรับสมัคร</p>
                    </div>
                  )}
                </div>

                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-zinc-500 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs h-12 rounded-xl"
                >
                  <Link href="/menu">ยกเลิกและกลับสู่หน้าหลัก</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-white/5 border-t border-white/5 p-6 justify-center">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-widest">
            <Info className="w-4 h-4" />
            โปรดตรวจสอบข้อมูลของคุณให้ถูกต้องก่อนดำเนินการ
          </div>
        </CardFooter>
      </Card>

      {/* Shared Dialog Instance */}
      <Dialog open={!!selectedElection} onOpenChange={(open) => !open && setSelectedElection(null)}>
        <DialogContent id="registration-dialog" className="max-w-[600px] border-white/10 bg-zinc-950 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl z-50">
          <div className="flex flex-col h-[90vh] max-h-[800px]">
            {/* Header */}
            <DialogHeader className="p-8 bg-zinc-900/50 border-b border-white/5 flex flex-row items-center gap-6 shrink-0">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/30 bg-zinc-800 shadow-xl">
                  {userImageUrl ? (
                    <Image src={userImageUrl} alt="Profile" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-400">
                      <UserPlus className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-tighter">รูปที่แสดงจะใช้ในการสมัครการเลือกตั้ง</p>
              </div>
              <div className="space-y-2 text-left">
                <DialogTitle className="text-white font-black text-2xl tracking-tight leading-none uppercase">
                  {employee?.name} {employee?.surname}
                </DialogTitle>
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 text-[11px] font-black text-zinc-400 uppercase tracking-widest border border-white/10">ID: {employee?.emp_id}</div>
                  <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-[11px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20">{employee?.site}</div>
                </div>
              </div>
            </DialogHeader>

            {/* Body - Scrollable */}
            <div className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar bg-zinc-950">
              {selectedElection && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <p className="text-indigo-400 font-black text-sm uppercase tracking-[0.2em] leading-tight">กำลังทำการสมัครเข้าชุดการเลือกตั้ง:</p>
                  <p className="text-white font-black text-lg uppercase tracking-tight mt-1">{selectedElection.title}</p>
                </div>
              )}

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                  <h5 className="text-indigo-400 font-black text-sm uppercase tracking-[0.2em]">[เจตนารมณ์ในการสมัคร]</h5>
                </div>
                <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
                  <p className="font-bold text-white text-base underline decoration-indigo-500/50 underline-offset-4">คณะกรรมการที่ได้รับแต่งตั้งมีวาระการปฎิบัติงาน 2 ปี โดยจะมีส่วนร่วมในภารกิจสำคัญ ข้าพเจ้ายินดีที่จะร่วมเป็นส่วนหนึ่งในการขับเคลื่อน แฟคซิเทค ไปข้างหน้าด้วยความมุ่งมั่น ดังนี้:</p>
                  
                  <ul className="space-y-5">
                    <li className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <p><span className="text-white font-bold">ร่วมสร้างมาตรฐานแห่งความเป็นเลิศ (Excellence & Discipline):</span> ข้าพเจ้าจะร่วมเป็นแบบอย่างและส่งเสริมให้ทีมงานรักษามาตรฐานการปฏิบัติงาน มีวินัยที่เข้มแข็ง และห่างไกลจากอบายมุข</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <p><span className="text-white font-bold">ร่วมบ่มเพาะวัฒนธรรมการเติบโต (Growth Culture):</span> ข้าพเจ้าพร้อมเสนอไอเดียในการคัดเลือกสมาชิกใหม่ที่มีหัวใจตรงกับเรา และร่วมวางรากฐานเส้นทางอาชีพให้ทุกคน</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <p><span className="text-white font-bold">ร่วมรังสรรค์ความสุขและความคิดสร้างสรรค์ (Happiness & Innovation):</span> ข้าพเจ้าจะร่วมนำเสนอแนวคิดใหม่ๆ เช่น กิจกรรมสร้างแรงจูงใจ เพื่อเปลี่ยนการทำงานให้เป็นพื้นที่แห่งโอกาส</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <p><span className="text-white font-bold">ร่วมเป็นพลังในการรักษาบุคลากร (Team Preservation):</span> ข้าพเจ้าจะทำหน้าที่เป็นกระบอกเสียง เพื่อร่วมวิเคราะห์และเสนอแนวทางในการดูแลทีมงานให้มีความสุขยั่งยืน</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <p><span className="text-white font-bold">ร่วมสร้างสะพานแห่งความเข้าใจ (Unified Communication):</span> ข้าพเจ้าพร้อมทำหน้าที่เป็นตัวกลางเชื่อมโยงวิสัยทัศน์ของบริษัทฯ สู่ทีมงานเพื่อให้ทุกคนก้าวเดินไปในทิศทางเดียวกัน</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <p><span className="text-white font-bold">ร่วมขับเคลื่อนองค์กร (Commitment & Participation):</span> ข้าพเจ้ายินดีเข้าร่วมประชุมกับฝ่ายบริหารอย่างน้อยไตรมาสละ 1 ครั้ง เพื่อร่วมวางแผนพัฒนาองค์กร</p>
                    </li>
                  </ul>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 transition-colors hover:bg-indigo-500/10">
                  <Checkbox 
                    id="agreeIntent" 
                    checked={isAgreedIntent} 
                    onCheckedChange={(checked) => setIsAgreedIntent(checked === true)}
                    className="border-indigo-500/30 data-checked:bg-indigo-600 data-checked:border-indigo-600"
                  />
                  <Label htmlFor="agreeIntent" className="text-xs font-bold text-indigo-300 cursor-pointer select-none">
                    ข้าพเจ้าขอรับรองและยืนยันในเจตนารมณ์ในการสมัครข้างต้น
                  </Label>
                </div>
              </section>

              <div className="h-px bg-white/5 w-full" />

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  <h5 className="text-emerald-400 font-black text-sm uppercase tracking-[0.2em]">[การรับรองและการปฏิบัติหน้าที่:]</h5>
                </div>
                <ul className="space-y-4 text-zinc-400 text-xs italic">
                  <li className="flex gap-3 text-emerald-400/80">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <p>รับทราบการปฏิบัติหน้าที่โดยความสมัครใจ โดยไม่มีค่าตอบแทนพิเศษเพิ่มเติม นอกเหนือจากค่าจ้างปกติ</p>
                  </li>
                  <li className="flex gap-3 text-emerald-400/80">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <p>ยินดีใช้เวลาปฏิบัติหน้าที่ภายในชั่วโมงการทำงานตามความเหมาะสม โดยไม่กระทบต่อหน้าที่หลัก</p>
                  </li>
                  <li className="flex gap-3 text-emerald-400/80">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <p>ขอรับรองว่ามีคุณสมบัติครบถ้วน และไม่เป็นลูกจ้างระดับบริหารที่มีอำนาจจ้างหรือเลิกจ้าง</p>
                  </li>
                </ul>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 transition-colors hover:bg-emerald-500/10 translate-y-2">
                  <Checkbox 
                    id="agreeCert" 
                    checked={isAgreedCert} 
                    onCheckedChange={(checked) => setIsAgreedCert(checked === true)}
                    className="border-emerald-500/30 data-checked:bg-emerald-600 data-checked:border-emerald-600"
                  />
                  <Label htmlFor="agreeCert" className="text-xs font-bold text-emerald-400 cursor-pointer select-none leading-relaxed">
                    ข้าพเจ้ายอมรับเงื่อนไขการปฏิบัติหน้าที่และขอรับรองว่าข้อมูลทั้งหมดเป็นความจริง
                  </Label>
                </div>
              </section>

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-red-500 font-black text-sm uppercase tracking-tight">เกิดข้อผิดพลาด</p>
                    <p className="text-red-400/80 text-xs font-bold leading-tight">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Sticky */}
            <div className="p-8 bg-zinc-900 border-t border-white/10 shrink-0">
              <Button
                disabled={isRegistering || !isAgreedIntent || !isAgreedCert}
                onClick={handleRegister}
                className="w-full h-16 rounded-[1.25rem] bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-white/5 disabled:opacity-100 text-white font-black text-xl transition-all shadow-[0_10px_30px_rgba(99,102,241,0.3)] disabled:shadow-none active:scale-95 group"
              >
                {isRegistering ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ยืนยันการสมัคร
                    <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
