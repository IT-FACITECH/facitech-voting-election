"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ElectionSummary {
  id: string;
  title: string;
  candidateCount: number;
}

interface ElectionSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  votes: ElectionSummary[];
  onConfirm: (electionId: string) => void;
}

export function ElectionSelectDialog({
  isOpen,
  onClose,
  votes,
  onConfirm,
}: ElectionSelectDialogProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selectedId) {
      setError("กรุณาเลือกรายการก่อนดำเนินการต่อ");
      return;
    }

    const selected = votes.find((v) => v.id === selectedId);
    if (selected && selected.candidateCount < 5) {
      setError(`การเลือกตั้ง "${selected.title}" มีจำนวนผู้สมัครไม่ครบ 5 ท่าน`);
      return;
    }

    setError(null);
    onConfirm(selectedId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] p-8">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-3xl font-black text-white tracking-tighter uppercase">เลือกการเลือกตั้ง</DialogTitle>
          <DialogDescription className="text-zinc-400 font-medium text-base">
            กรุณาเลือกรายการที่คุณต้องการดำเนินการต่อ
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 space-y-6">
          <Select value={selectedId} onValueChange={(val) => {
            setSelectedId(val);
            setError(null);
          }}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-16 rounded-2xl focus:ring-indigo-500 hover:bg-white/10 transition-all font-bold text-lg px-6">
              <SelectValue placeholder="--- คลิกเพื่อเลือกรายการ ---" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl p-2 shadow-2xl">
              {votes.map((v) => (
                <SelectItem 
                  key={v.id} 
                  value={v.id} 
                  className="focus:bg-indigo-600 focus:text-white cursor-pointer py-4 rounded-xl px-4 transition-colors"
                >
                  <span className="font-bold">{v.title}</span>
                  <span className="text-xs text-zinc-500 ml-2">({v.candidateCount} ผู้สมัคร)</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">ข้อผิดพลาด</AlertTitle>
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-row gap-3 sm:gap-3 justify-center sm:justify-end bg-transparent border-none p-0 mx-0 mb-0 mt-8">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 sm:flex-none text-zinc-400 hover:text-white hover:bg-white/5 font-bold h-12 rounded-2xl"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 px-8 rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
          >
            ตกลง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
