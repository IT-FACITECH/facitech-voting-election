"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { castVote } from "@/app/actions/vote";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Vote, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

const votingSchema = z.object({
  selectedCandidates: z
    .array(z.string())
    .length(5, "กรุณาเลือกผู้สมัครให้ครบ 5 ท่าน"),
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

// แยก CandidateCard ออกมาและใช้ memo เพื่อป้องกันการ re-render ของการ์ดใบอื่นที่ไม่เกี่ยวข้อง
const CandidateCard = memo(({ 
  candidate, 
  isSelected, 
  isDisabled, 
  onToggle 
}: { 
  candidate: Candidate; 
  isSelected: boolean; 
  isDisabled: boolean; 
  onToggle: (id: string) => void;
}) => {
  return (
    <div
      onClick={() => !isDisabled && onToggle(candidate.id)}
      className={cn(
        "cursor-pointer group relative flex flex-col items-center p-6 md:p-10 rounded-[2.5rem] border-2 transition-all duration-500",
        isSelected
          ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_60px_rgba(75,57,239,0.3)] scale-[1.02]"
          : "bg-zinc-950/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/40",
        !isSelected && isDisabled && "opacity-20 grayscale cursor-not-allowed scale-[0.98]",
      )}
    >
      <div className="relative w-24 h-24 md:w-36 md:h-36 mb-6 md:mb-10">
        <div
          className={cn(
            "absolute -inset-6 rounded-full blur-3xl transition-opacity duration-700",
            isSelected ? "bg-indigo-500/40 opacity-100" : "bg-white/5 opacity-0 group-hover:opacity-100",
          )}
        />

        {candidate.image_url ? (
          <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-br from-white/20 to-transparent shadow-2xl">
            <Image
              src={candidate.image_url}
              alt={candidate.name}
              fill
              priority={candidate.number <= 6} // ให้โหลดรูปภาพแรกๆ ทันที
              className="rounded-full object-cover relative z-10 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-5xl font-black text-zinc-700 shadow-inner relative z-10 border-4 border-white/5">
            {candidate.number}
          </div>
        )}

        {isSelected && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-2 shadow-2xl border-4 border-indigo-500 z-20 animate-in zoom-in spin-in-90 duration-500">
            <Check className="w-5 h-5 md:w-7 md:h-7 text-indigo-500 stroke-[4]" />
          </div>
        )}
      </div>

      <div className="text-center w-full space-y-5 relative z-10">
        <Badge
          variant={isSelected ? "default" : "secondary"}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg",
            isSelected ? "bg-white text-indigo-600 hover:bg-white" : "bg-zinc-800 text-zinc-200 border-white/10",
          )}
        >
          เบอร์ {candidate.number}
        </Badge>

        <div className="space-y-1">
          <h3 className="font-black text-white text-base md:text-xl leading-tight tracking-tight group-hover:text-indigo-300 transition-colors truncate w-full">
            {candidate.name}
          </h3>
          {candidate.site && (
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest bg-white/10 py-1.5 px-3 rounded-lg inline-block border border-white/5">
              {candidate.site}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

CandidateCard.displayName = "CandidateCard";

export default function VotingForm({
  electionId,
  candidates,
}: VotingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
        { shouldValidate: true },
      );
    } else if (current.length < 5) {
      setValue("selectedCandidates", [...current, candidateId], {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (data: VotingFormValues) => {
    const result = await Swal.fire({
      title: "ยืนยันการลงคะแนน?",
      text: "คุณกำลังจะลงคะแนนให้ผู้สมัครทั้ง 5 ท่าน การดำเนินการนี้ไม่สามารถย้อนกลับได้",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4B39EF",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "ใช่, ลงคะแนนเลย",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      background: "rgba(24, 24, 27, 0.95)",
      color: "#ffffff",
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
          title: "เกิดข้อผิดพลาด",
          text: voteResult.error,
          icon: "error",
          confirmButtonColor: "#4B39EF",
          background: "rgba(24, 24, 27, 0.95)",
          color: "#ffffff",
        });
      } else {
        Swal.fire({
          title: "ลงคะแนนสำเร็จ!",
          text: "ขอบคุณที่ร่วมใช้สิทธิ์เลือกตั้ง ระบบกำลังพาคุณไปหน้าขอบคุณ...",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "rgba(24, 24, 27, 0.95)",
          color: "#ffffff",
        });
        setTimeout(() => {
          router.push("/thanks");
        }, 2000);
      }
    } catch (error) {
      console.error("Error voting:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่อใหม่อีกครั้ง",
        icon: "error",
        confirmButtonColor: "#4B39EF",
        background: "rgba(24, 24, 27, 0.95)",
        color: "#ffffff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-12">
      {/* Selection Status */}
      <div className="sticky top-4 z-20 flex flex-col gap-2 bg-zinc-950/80 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-4 h-4 rounded-full shadow-[0_0_15px_rgba(75,57,239,0.5)]",
                selectedCandidates.length === 5
                  ? "bg-emerald-500"
                  : "bg-indigo-400 animate-pulse",
              )}
            />
            <p className="font-black text-white text-lg md:text-xl tracking-tight">
              เลือกไปแล้ว:{" "}
              <span className="text-4xl text-indigo-300 ml-1 font-black">
                {selectedCandidates.length}
              </span>{" "}
              <span className="text-zinc-300 text-sm font-bold">/ 5 ท่าน</span>
            </p>
          </div>
          {selectedCandidates.length === 5 ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 rounded-full text-xs font-black animate-bounce">
              <Check className="w-3.5 h-3.5 mr-1.5 stroke-[3]" />
              พร้อมลงคะแนน
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-indigo-100 border-indigo-500/50 bg-indigo-500/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              โปรดเลือกให้ครบ 5 ท่าน
            </Badge>
          )}
        </div>
        {errors.selectedCandidates && (
          <p className="text-xs text-red-400 font-bold px-1 mt-1">
            {errors.selectedCandidates.message}
          </p>
        )}
      </div>

      {/* Candidates Selection */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-2">
          <div className="h-px flex-1 bg-white/10" />
          <h3 className="text-[10px] font-black text-indigo-300/70 uppercase tracking-[0.5em]">
            Candidate List
          </h3>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {candidates.map((candidate) => (
            <CandidateCard 
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidates.includes(candidate.id)}
              isDisabled={!selectedCandidates.includes(candidate.id) && selectedCandidates.length >= 5}
              onToggle={toggleCandidate}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 pt-10 md:pt-20 pb-10">
        {selectedCandidates.length < 5 && (
          <div className="flex items-center gap-3 bg-zinc-950/50 px-8 py-3 rounded-full border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(75,57,239,0.8)]" />
            <p className="text-zinc-200 font-bold text-xs uppercase tracking-[0.2em]">
              โปรดเลือกเพิ่มอีก{" "}
              <span className="text-indigo-300 text-lg mx-1 font-black">
                {5 - selectedCandidates.length}
              </span>{" "}
              ท่านให้ครบตามกำหนด
            </p>
          </div>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || selectedCandidates.length !== 5}
          className="w-full max-w-xl h-20 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-2xl shadow-[0_25px_80px_rgba(75,57,239,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-8 h-8 mr-3 animate-spin" />
              <span className="tracking-tight uppercase">
                กำลังบันทึกคะแนน...
              </span>
            </>
          ) : (
            <>
              <Vote className="w-8 h-8 mr-3" />
              <span className="tracking-tight uppercase">
                ลงคะแนนโหวต (VOTE NOW)
              </span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
