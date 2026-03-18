"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  LayoutList,
  Save,
  Undo2,
  Lock,
  ChevronRight
} from "lucide-react";
import Swal from "sweetalert2";

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
};

export default function ElectionManagementView() {
  const [elections, setElections] = useState<Election[]>([]);
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

  useEffect(() => {
    fetchElections();
  }, []);

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

  const toLocalISO = (dateStr: string) => {
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
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
      reg_start_date: toLocalISO(election.reg_start_date),
      reg_end_date: toLocalISO(election.reg_end_date),
      start_date: toLocalISO(election.start_date),
      end_date: toLocalISO(election.end_date),
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isEnded = (date: string) => new Date() > new Date(date);

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight">
          ระบบบริหารจัดการการเลือกตั้ง
        </h1>
        <p className="text-white/60 font-medium">จัดการช่วงเวลา ข้อมูล และติดตามความคืบหน้าของการเลือกตั้ง</p>
      </div>

      {/* Form Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className={`p-3 rounded-2xl ${isEditing ? 'bg-orange-500/20' : 'bg-indigo-500/20'}`}>
              {isEditing ? <Edit2 className="w-6 h-6 text-orange-400" /> : <Plus className="w-6 h-6 text-indigo-400" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                {isEditing ? "แก้ไขการเลือกตั้ง" : "จัดตั้งการเลือกตั้งใหม่"}
              </h2>
              <p className="text-white/40 text-sm font-medium">กรอกข้อมูลให้ครบถ้วนเพื่อสร้างกำหนดการ</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1">1. ชื่อการเลือกตั้ง</label>
                  <input
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-white/20"
                    placeholder="เช่น เลือกตั้งคณะกรรมการชุดปี 2567"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1">2. รายละเอียด</label>
                  <textarea
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-white/20"
                    placeholder="วัตถุประสงค์ หรือรายละเอียดอื่นๆ..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Timeframes */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> 3. วันรับสมัคร
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none transition-all"
                      value={formData.reg_start_date}
                      onChange={(e) => setFormData({ ...formData, reg_start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> 4. วันปิดรับสมัคร
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none transition-all"
                      value={formData.reg_end_date}
                      onChange={(e) => setFormData({ ...formData, reg_end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-orange-400" /> 5. เริ่มโหวต
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none transition-all"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-red-400" /> 6. ปิดโหวต
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none transition-all"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-grow py-5 px-8 rounded-2xl text-white font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${
                  isEditing ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20' : 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    <span>{isEditing ? "บันทึกการแก้ไข" : "ยืนยันการจัดตั้ง"}</span>
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialForm);
                    setIsEditing(false);
                  }}
                  className="px-8 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold transition-all"
                >
                  <Undo2 className="w-6 h-6" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-white/5">
            <LayoutList className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">รายการการเลือกตั้งทั้งหมด</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {elections.map((item) => {
            const ended = isEnded(item.end_date);
            return (
              <div 
                key={item.id}
                className={`group relative overflow-hidden bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${!ended && 'hover:bg-white/10 hover:border-white/20'}`}
              >
                {ended && (
                   <div className="absolute top-0 right-0 p-4">
                      <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-red-500/20 border border-red-400/20">
                        <Lock className="w-3 h-3 text-white" /> สิ้นสุดแล้ว
                      </div>
                   </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-white">{item.title}</h3>
                    {item.is_active ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm font-medium text-white/40">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> รับสมัคร: {formatDate(item.reg_start_date)} - {formatDate(item.reg_end_date)}</span>
                    <span className="flex items-center gap-1.5 text-indigo-300"><Clock className="w-3.5 h-3.5" /> โหวต: {formatDate(item.start_date)} - {formatDate(item.end_date)}</span>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <div className="text-xs font-bold text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">
                      ผู้สมัคร: {item._count?.candidates || 0}
                    </div>
                    <div className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/10 uppercase tracking-widest">
                      โหวตแล้ว: {item._count?.votes || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleEdit(item)}
                    disabled={ended}
                    className={`flex-grow md:flex-none py-3 px-6 rounded-2xl flex items-center justify-center gap-2 font-black transition-all ${
                      ended 
                      ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                      : 'bg-white text-black hover:scale-105 active:scale-95'
                    }`}
                  >
                    {ended ? <Lock className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    แก้ไข
                  </button>
                  <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            );
          })}

          {elections.length === 0 && (
            <div className="text-center py-20 bg-white/5 border border-white/5 border-dashed rounded-3xl">
              <p className="text-white/20 font-medium">ยังไม่มีข้อมูลการเลือกตั้ง</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
