"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  PlusCircle, 
  UserPlus, 
  Vote, 
  ChevronRight,
  ShieldCheck,
  Lock,
  ListFilter,
  CheckCircle2
} from "lucide-react";
import Swal from "sweetalert2";

interface ElectionSummary {
  id: string;
  title: string;
  candidateCount: number;
}

interface MenuViewProps {
  canManage: boolean;
  electionStatus: {
    isRegOpen: boolean;
    isVoteOpen: boolean;
    isAllVoted: boolean;
    candidateCount: number;
    availableVotes: ElectionSummary[];
  };
}

export default function MenuView({ canManage, electionStatus }: MenuViewProps) {
  const router = useRouter();

  const handleVoteClick = async () => {
    const votes = electionStatus.availableVotes;

    if (votes.length === 0) return;

    if (votes.length === 1) {
      const vote = votes[0];
      if (vote.candidateCount < 5) {
        Swal.fire({
          title: "ไม่สามารถเข้าโหวตได้",
          text: `การเลือกตั้ง "${vote.title}" มีจำนวนผู้สมัครไม่ครบ 5 ท่าน`,
          icon: "warning",
          background: "rgba(24, 24, 27, 0.95)",
          color: "#fff"
        });
        return;
      }
      router.push(`/vote?id=${vote.id}`);
      return;
    }

    // Multiple elections available
    const { value: electionId } = await Swal.fire({
      title: "เลือกรายการการเลือกตั้ง",
      text: "กรุณาเลือกรายการที่คุณต้องการลงคะแนน",
      icon: "question",
      input: "select",
      inputOptions: Object.fromEntries(
        votes.map(v => [v.id, `${v.title} (${v.candidateCount} ผู้สมัคร)`])
      ),
      inputPlaceholder: "--- เลือกการเลือกตั้ง ---",
      showCancelButton: true,
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
      background: "rgba(24, 24, 27, 0.95)",
      color: "#fff",
      confirmButtonColor: "#6366f1",
      inputValidator: (value) => {
        if (!value) return "กรุณาเลือกรายการก่อนดำเนินการต่อ";
        const selected = votes.find(v => v.id === value);
        if (selected && selected.candidateCount < 5) {
          return `การเลือกตั้ง "${selected.title}" มีจำนวนผู้สมัครไม่ครบ 5 ท่าน`;
        }
        return null;
      }
    });

    if (electionId) {
      router.push(`/vote?id=${electionId}`);
    }
  };

  const getVoteMessage = () => {
    if (electionStatus.isAllVoted) return "คุณทำการโหวตลงคะแนนเรียบร้อยแล้ว";
    if (!electionStatus.isVoteOpen) return "ยังไม่อยู่ในช่วงเวลาการโหวต";
    return "";
  };

  const menuItems = [
    {
      title: "จัดตั้งการเลือกตั้ง",
      description: "กำหนดช่วงเวลา หัวข้อ และรายละเอียดสำหรับการเลือกตั้งครั้งใหม่",
      href: "/admin/elections",
      icon: PlusCircle,
      color: "from-blue-500 to-cyan-500",
      show: canManage,
      isDisabled: false,
      message: "",
      onClick: null
    },
    {
      title: "ลงทะเบียนเป็นผู้สมัคร",
      description: "เสนอชื่อตัวคุณเองเพื่อเข้ารับการคัดเลือกเป็นคณะกรรมการ",
      href: "/admin/candidates/register",
      icon: UserPlus,
      color: "from-purple-500 to-pink-500",
      show: true,
      isDisabled: !electionStatus.isRegOpen,
      message: "ยังไม่อยู่ในช่วงเวลาลงทะเบียน",
      onClick: null
    },
    {
      title: "เข้าสู่ระบบโหวตคะแนน",
      description: "ไปที่หน้าการเลือกตั้งที่กำลังดำเนินการอยู่เพื่อลงคะแนนเสียง",
      href: "/vote",
      icon: Vote,
      color: "from-orange-500 to-red-500",
      show: true,
      isDisabled: !electionStatus.isVoteOpen || electionStatus.isAllVoted,
      message: getVoteMessage(),
      onClick: handleVoteClick
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-20">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4" />
            ยินดีต้อนรับสู่ระบบบริหารจัดการ
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            เลือก <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">เมนูการใช้งาน</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium">
            คุณสามารถเลือกดำเนินการจัดการการเลือกตั้ง สมัครเข้ารับการคัดเลือก หรือลงคะแนนเสียงได้จากเมนูด้านล่างนี้
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.filter(item => item.show).map((item, index) => {
            const isVoteButton = item.title === "เข้าสู่ระบบโหวตคะแนน";
            
            const CardContent = (
              <>
                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.isDisabled ? 'from-zinc-600 to-zinc-800' : item.color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  {item.isDisabled ? (
                    electionStatus.isAllVoted && isVoteButton ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <Lock className="w-8 h-8 text-white/40" />
                  ) : (
                    <item.icon className="w-8 h-8 text-white" />
                  )}
                </div>

                <div className="flex-grow space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-2xl font-black ${item.isDisabled ? 'text-white/40' : 'text-white'} tracking-tight group-hover:text-indigo-300 transition-colors`}>
                      {item.title}
                    </h3>
                    {isVoteButton && electionStatus.availableVotes.length > 1 && !item.isDisabled && (
                      <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">
                        {electionStatus.availableVotes.length} รายการ
                      </span>
                    )}
                  </div>
                  <p className={`${item.isDisabled ? 'text-white/20' : 'text-white/60'} leading-relaxed font-medium`}>
                    {item.description}
                  </p>
                </div>

                <div className={`mt-8 flex items-center gap-2 ${item.isDisabled ? 'text-white/10' : 'text-white/40'} font-bold text-sm uppercase tracking-wider group-hover:text-white transition-colors`}>
                  {item.isDisabled ? (
                     electionStatus.isAllVoted && isVoteButton ? "ดำเนินการเสร็จสิ้น" : "ล็อคการเข้าถึง"
                  ) : (
                    isVoteButton && electionStatus.availableVotes.length > 1 ? "เลือกการเลือกตั้ง" : "ดำเนินการต่อ"
                  )}
                  {isVoteButton && electionStatus.availableVotes.length > 1 && !item.isDisabled ? <ListFilter className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
                </div>

                {item.isDisabled && (
                  <div className={`absolute inset-0 flex items-center justify-center ${electionStatus.isAllVoted && isVoteButton ? 'bg-emerald-950/20' : 'bg-zinc-950/40'} backdrop-blur-[2px] p-6 text-center`}>
                    <div className={`${electionStatus.isAllVoted && isVoteButton ? 'bg-emerald-900/80 border-emerald-500/30' : 'bg-zinc-900/80 border-white/10'} border px-4 py-2 rounded-xl shadow-2xl`}>
                      <p className={`${electionStatus.isAllVoted && isVoteButton ? 'text-emerald-300' : 'text-white/80'} font-black text-sm uppercase tracking-tighter`}>
                        {item.message}
                      </p>
                    </div>
                  </div>
                )}
              </>
            );

            if (item.isDisabled) {
              return (
                <div 
                  key={index} 
                  className={`group relative flex flex-col h-full bg-white/5 backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-8 overflow-hidden cursor-not-allowed ${electionStatus.isAllVoted && isVoteButton ? 'opacity-90' : 'opacity-60'}`}
                >
                  {CardContent}
                </div>
              );
            }

            if (item.onClick) {
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="group relative flex flex-col text-left h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 overflow-hidden w-full"
                >
                  {CardContent}
                </button>
              );
            }

            return (
              <Link 
                key={index} 
                href={item.href}
                className="group relative flex flex-col h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 overflow-hidden"
              >
                {CardContent}
              </Link>
            );
          })}
        </div>

        <div className="pt-10 text-center">
          <p className="text-white/30 text-sm font-medium">
            หากมีปัญหาในการใช้งาน กรุณาติดต่อฝ่ายไอที หรือทีมผู้ดูแลระบบ
          </p>
        </div>
      </div>
    </div>
  );
}
