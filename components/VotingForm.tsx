"use client";

import { useState } from "react";
import Image from "next/image";
import { castVote } from "@/app/actions/vote";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import Swal from "sweetalert2";

const votingSchema = z.object({
  selectedCandidates: z.array(z.string()).length(5, "กรุณาเลือกผู้สมัครให้ครบ 5 ท่าน"),
});

type VotingFormValues = z.infer<typeof votingSchema>;

interface Candidate {
  id: string;
  number: number;
  name: string;
  bio?: string | null;
  image_url?: string | null;
  site?: string | null;
}

interface VotingFormProps {
  electionId: string;
  candidates: Candidate[];
}

export default function VotingForm({ electionId, candidates }: VotingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VotingFormValues>({
    resolver: zodResolver(votingSchema),
    defaultValues: {
      selectedCandidates: [],
    },
  });

  const selectedCandidates = watch("selectedCandidates");

  const toggleCandidate = (candidateId: string) => {
    const current = [...selectedCandidates];
    if (current.includes(candidateId)) {
      setValue(
        "selectedCandidates",
        current.filter((id) => id !== candidateId),
        { shouldValidate: true }
      );
    } else if (current.length < 5) {
      setValue("selectedCandidates", [...current, candidateId], {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (data: VotingFormValues) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลงคะแนน?',
      text: "คุณกำลังจะลงคะแนนให้ผู้สมัครทั้ง 5 ท่าน การดำเนินการนี้ไม่สามารถย้อนกลับได้",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4B39EF',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'ใช่, ลงคะแนนเลย',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      background: 'rgba(24, 24, 27, 0.95)',
      color: '#ffffff',
      backdrop: `
        rgba(0,0,123,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    try {
      const voteResult = await castVote({
        electionId,
        candidateIds: data.selectedCandidates,
      });

      if (voteResult?.error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: voteResult.error,
          icon: 'error',
          confirmButtonColor: '#4B39EF',
          background: 'rgba(24, 24, 27, 0.95)',
          color: '#ffffff',
        });
      } else {
        Swal.fire({
          title: 'ลงคะแนนสำเร็จ!',
          text: 'ขอบคุณที่ร่วมใช้สิทธิ์เลือกตั้ง',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: 'rgba(24, 24, 27, 0.95)',
          color: '#ffffff',
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonColor: '#4B39EF',
        background: 'rgba(24, 24, 27, 0.95)',
        color: '#ffffff',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-12">
      {/* Selection Status */}
      <div className="sticky top-4 z-20 flex flex-col gap-2 bg-indigo-900/40 backdrop-blur-2xl p-3 md:p-5 rounded-2xl md:rounded-[2rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-indigo-400/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${selectedCandidates.length === 5 ? 'bg-green-400' : 'bg-indigo-400 animate-pulse'}`} />
            <p className="font-black text-white text-base md:text-lg tracking-tight">
              เลือกไปแล้ว: <span className="text-3xl text-indigo-300 ml-1">{selectedCandidates.length}</span> <span className="text-zinc-400 text-sm font-medium">/ 5</span>
            </p>
          </div>
          {selectedCandidates.length === 5 ? (
            <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-black animate-bounce flex items-center gap-2 border border-green-500/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              พร้อมลงคะแนน
            </span>
          ) : (
             <span className="text-indigo-300/60 text-xs font-bold uppercase tracking-widest">
               โปรดเลือกให้ครบ 5 ท่าน
             </span>
          )}
        </div>
        {errors.selectedCandidates && (
          <p className="text-xs text-red-400 font-bold px-1">{errors.selectedCandidates.message}</p>
        )}
      </div>

      {/* Candidates Selection */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-2">
           <div className="h-px flex-1 bg-white/10" />
           <h3 className="text-sm font-black text-indigo-300 uppercase tracking-[0.3em]">รายชื่อผู้สมัคร</h3>
           <div className="h-px flex-1 bg-white/10" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {candidates.map((candidate) => {
            const isSelected = selectedCandidates.includes(candidate.id);
            return (
              <div
                key={candidate.id}
                onClick={() => toggleCandidate(candidate.id)}
                className={`cursor-pointer group relative flex flex-col items-center p-4 md:p-8 rounded-2xl md:rounded-[3rem] border-2 transition-all duration-500 ${
                  isSelected
                    ? "bg-indigo-600/30 border-indigo-400 shadow-[0_0_50px_rgba(75,57,239,0.3)] scale-[1.05]"
                    : "bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5"
                } ${!isSelected && selectedCandidates.length >= 5 ? "opacity-30 grayscale cursor-not-allowed" : ""}`}
              >
                <div className="relative w-20 h-20 md:w-32 md:h-32 mb-4 md:mb-8">
                  <div className={`absolute -inset-4 rounded-full blur-2xl transition-opacity duration-500 ${isSelected ? 'bg-indigo-500/40 opacity-100' : 'bg-white/10 opacity-0 group-hover:opacity-100'}`} />
                  {candidate.image_url ? (
                    <Image
                      src={candidate.image_url}
                      alt={candidate.name}
                      fill
                      className="rounded-full object-cover shadow-2xl border-4 border-white/20 relative z-10"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center text-4xl font-black text-white/50 shadow-inner relative z-10 border-4 border-white/10">
                      {candidate.number}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-1.5 md:p-2.5 shadow-2xl border-2 md:border-4 border-indigo-500 z-20 animate-in zoom-in spin-in-90 duration-500">
                      <svg className="w-4 h-4 md:w-6 md:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center w-full space-y-4 relative z-10">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`px-3 py-1 md:px-5 md:py-1.5 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-sm ${
                      isSelected ? "bg-white text-indigo-600" : "bg-white/10 text-indigo-200"
                    }`}>
                      เบอร์ {candidate.number}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-sm md:text-2xl leading-[1.1] tracking-tight">{candidate.name}</h3>
                  {candidate.site && (
                    <div className="bg-black/40 py-2 px-4 rounded-[1rem] inline-block max-w-full">
                      <p className="text-[10px] md:text-[11px] text-zinc-400 font-bold break-all uppercase tracking-[0.1em]">
                        {candidate.site}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 pt-8 md:pt-14 pb-10">
        {selectedCandidates.length < 5 && (
          <div className="flex items-center gap-3 bg-indigo-500/10 px-8 py-3 rounded-full border border-indigo-400/20 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <p className="text-indigo-200 font-black text-sm uppercase tracking-widest">
              กรุณาเลือกเพิ่มอีก {5 - selectedCandidates.length} ท่าน
            </p>
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full max-w-lg overflow-hidden py-6 px-10 rounded-[2.5rem] bg-gradient-to-r from-indigo-500 via-indigo-600 to-[#4B39EF] text-white font-black text-xl shadow-[0_20px_80px_rgba(75,57,239,0.4)] hover:shadow-[0_25px_100px_rgba(75,57,239,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale disabled:pointer-events-none"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex items-center justify-center gap-4">
            {isSubmitting ? (
              <>
                <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="tracking-tight">กำลังบันทึกคะแนน...</span>
              </>
            ) : (
              <span className="tracking-tight uppercase">ลงคะแนนโหวต (VOTE 5 ท่าน)</span>
            )}
          </div>
        </button>
      </div>
    </form>
  );
}
