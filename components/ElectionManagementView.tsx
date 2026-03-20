"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  LayoutList,
  Save,
  Undo2,
  Lock,
  ChevronRight,
  Info
} from "lucide-react";
import Swal from "sweetalert2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Election {
  id: string;
  title: string;
  description: string;
  reg_start_date: string;
  reg_end_date: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  _count?: {
    candidates: number;
    votes: number;
  };
}

const initialForm = {
  id: "",
  title: "",
  description: "",
  reg_start_date: "",
  reg_end_date: "",
  start_date: "",
  end_date: "",
  is_active: true,
};

interface ElectionManagementProps {
  initialElections?: Election[];
}

export default function ElectionManagementView({ initialElections = [] }: ElectionManagementProps) {
  const [elections, setElections] = useState<Election[]>(initialElections);
  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchElections = async () => {
    try {
      const res = await fetch("/api/admin/elections");
      const data = await res.json();
      setElections(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ไม่จำเป็นต้องใช้ useEffect ในการดึงข้อมูลครั้งแรกแล้ว เพราะข้อมูลถูกส่งผ่าน props มาแล้ว
  // แต่สามารถเก็บไว้ได้หากต้องการให้ข้อมูลอัปเดตแบบเรียลไทม์มากขึ้นเมื่อ Component mount
  useEffect(() => {
    if (initialElections.length === 0) {
      fetchElections();
    }
  }, [initialElections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const method = isEditing ? "PUT" : "POST";
    const body = isEditing ? formData : { ...formData, id: undefined };

    try {
      const res = await fetch("/api/admin/elections", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        Swal.fire({
          title: "สำเร็จ!",
          text: isEditing ? "แก้ไขข้อมูลสำเร็จ" : "จัดตั้งการเลือกตั้งสำเร็จ",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "rgba(24, 24, 27, 0.95)",
          color: "#fff"
        });
        setFormData(initialForm);
        setIsEditing(false);
        fetchElections();
      } else {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: message,
        icon: "error",
        background: "rgba(24, 24, 27, 0.95)",
        color: "#fff"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toThaiISO = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date).replace(' ', 'T');
  };

  const handleEdit = (election: Election) => {
    const ended = new Date() > new Date(election.end_date);
    if (ended) {
      Swal.fire({
        title: "ไม่สามารถแก้ไขได้",
        text: "การเลือกตั้งครั้งนี้สิ้นสุดช่วงเวลาโหวตไปแล้ว",
        icon: "info",
        background: "rgba(24, 24, 27, 0.95)",
        color: "#fff"
      });
      return;
    }

    setFormData({
      id: election.id,
      title: election.title,
      description: election.description || "",
      reg_start_date: toThaiISO(election.reg_start_date),
      reg_end_date: toThaiISO(election.reg_end_date),
      start_date: toThaiISO(election.start_date),
      end_date: toThaiISO(election.end_date),
      is_active: election.is_active,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Bangkok",
    });
  };

  const isEnded = (date: string) => new Date() > new Date(date);

  return (
    <div className="container max-w-6xl mx-auto space-y-12 pb-20 pt-8">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight sm:text-5xl">
          ELECTION <span className="text-indigo-400">PORTAL</span>
        </h1>
        <p className="text-zinc-300 font-medium max-w-lg mx-auto">จัดการช่วงเวลา ข้อมูล และติดตามความคืบหน้าของการเลือกตั้งแบบครบวงจร</p>
      </div>

      {/* Form Section */}
      <Card className="border-indigo-500/30 bg-zinc-950/60 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 rounded-[2rem] overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-2xl shadow-inner",
              isEditing ? "bg-orange-500/20 text-orange-400" : "bg-indigo-500/30 text-indigo-300"
            )}>
              {isEditing ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-wider text-white">
                {isEditing ? "แก้ไขการเลือกตั้ง" : "จัดตั้งการเลือกตั้งใหม่"}
              </CardTitle>
              <CardDescription className="text-zinc-400 font-medium">กรอกข้อมูลให้ครบถ้วนเพื่อสร้างกำหนดการ</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-indigo-200 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    <Info className="w-3 h-3" /> 1. ชื่อการเลือกตั้ง
                  </Label>
                  <Input
                    required
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-lg focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400 transition-all text-white"
                    placeholder="เช่น เลือกตั้งคณะกรรมการชุดปี 2567"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-indigo-200 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    <LayoutList className="w-3 h-3" /> 2. รายละเอียด
                  </Label>
                  <textarea
                    rows={4}
                    className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                    placeholder="วัตถุประสงค์ หรือรายละเอียดอื่นๆ..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                {isEditing && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                     <Label className="text-white font-bold">เปิดใช้งาน (Active Status)</Label>
                     <Switch 
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                     />
                  </div>
                )}
              </div>

              {/* Timeframes */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label className="text-emerald-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> 3. วันรับสมัคร
                    </Label>
                    <Input
                      type="datetime-local"
                      required
                      className="bg-white/5 border-white/10 h-11 rounded-xl focus-visible:ring-indigo-400/50 transition-all text-white"
                      value={formData.reg_start_date}
                      onChange={(e) => setFormData({ ...formData, reg_start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <Clock className="w-3 h-3" /> 4. วันปิดรับสมัคร
                    </Label>
                    <Input
                      type="datetime-local"
                      required
                      className="bg-white/5 border-white/10 h-11 rounded-xl focus-visible:ring-indigo-400/50 transition-all text-white"
                      value={formData.reg_end_date}
                      onChange={(e) => setFormData({ ...formData, reg_end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label className="text-orange-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> 5. เริ่มโหวต
                    </Label>
                    <Input
                      type="datetime-local"
                      required
                      className="bg-white/5 border-white/10 h-11 rounded-xl focus-visible:ring-indigo-400/50 transition-all text-white"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <Clock className="w-3 h-3" /> 6. ปิดโหวต
                    </Label>
                    <Input
                      type="datetime-local"
                      required
                      className="bg-white/5 border-white/10 h-11 rounded-xl focus-visible:ring-indigo-400/50 transition-all text-white"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5 mt-6">
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className={cn(
                  "flex-grow h-16 rounded-2xl text-lg font-black transition-all shadow-xl active:scale-95",
                  isEditing ? "bg-orange-500 hover:bg-orange-600" : "bg-indigo-600 hover:bg-indigo-700"
                )}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-6 h-6 mr-2" />
                    <span>{isEditing ? "บันทึกการแก้ไข" : "ยืนยันการจัดตั้ง"}</span>
                  </>
                )}
              </Button>
              
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setFormData(initialForm);
                    setIsEditing(false);
                  }}
                  className="h-16 px-8 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Undo2 className="w-6 h-6" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <LayoutList className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">รายการการเลือกตั้ง</h2>
              <p className="text-zinc-400 text-sm font-medium">รวมทั้งหมด {elections.length} รายการ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {elections.map((item) => {
            const ended = isEnded(item.end_date);
            return (
              <Card 
                key={item.id}
                className={cn(
                  "group relative overflow-hidden bg-zinc-950/40 border-white/5 rounded-[2rem] hover:border-indigo-500/30 transition-all duration-500",
                  ended && "opacity-80 grayscale-[0.5]"
                )}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center">
                    {/* Status Color Bar */}
                    <div className={cn(
                      "w-full md:w-2 h-2 md:h-auto self-stretch",
                      ended ? "bg-zinc-800" : item.is_active ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    
                    <div className="flex-grow p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center flex-wrap gap-3">
                          <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                          <div className="flex gap-2">
                            {item.is_active ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">เปิดใช้งาน</Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">ปิดการทำงาน</Badge>
                            )}
                            {ended && (
                              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-white/5">
                                <Lock className="w-3 h-3 mr-1" /> สิ้นสุดแล้ว
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">ช่วงเวลารับสมัคร</p>
                            <p className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                              {formatDate(item.reg_start_date)} - {formatDate(item.reg_end_date)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">ช่วงเวลาโหวต</p>
                            <p className="text-sm font-bold text-indigo-200 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDate(item.start_date)} - {formatDate(item.end_date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">ผู้สมัคร</span>
                            <span className="text-lg font-black text-white">{item._count?.candidates || 0}</span>
                          </div>
                          <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex flex-col items-center">
                            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest leading-tight">ผู้โหวตทั้งหมด</span>
                            <span className="text-lg font-black text-indigo-300">{item._count?.votes || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button
                          onClick={() => handleEdit(item)}
                          disabled={ended}
                          variant={ended ? "secondary" : "default"}
                          size="lg"
                          className={cn(
                            "flex-grow md:flex-none h-14 px-8 rounded-2xl font-black transition-all",
                            !ended && "bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95"
                          )}
                        >
                          {ended ? <Lock className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                          แก้ไขข้อมูล
                        </Button>
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10">
                          <ChevronRight className="w-6 h-6 text-zinc-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {elections.length === 0 && (
            <Card className="bg-zinc-950/20 border-dashed border-white/5 rounded-[2rem] py-24">
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-full bg-white/5">
                  <Info className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-500 font-bold text-xl uppercase tracking-widest">ยังไม่มีข้อมูลการเลือกตั้ง</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
