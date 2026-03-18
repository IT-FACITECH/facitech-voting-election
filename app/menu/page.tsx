import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MenuView from "@/components/MenuView";
import Header from "@/components/Header";

export default async function MenuPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  // Check if user has completed their profile
  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
  });

  // ถ้ายังไม่กรอก Profile ให้เด้งไปหน้ากรอกข้อมูล
  if (!dbUser || !dbUser.employee_id || !dbUser.name) {
    redirect("/complete-profile");
  }

  // ดึงข้อมูลพนักงานเพื่อเช็คตำแหน่ง
  const employee = await prisma.employees.findUnique({
    where: { emp_id: dbUser.employee_id },
  });

  const allowedPositions = [
    "Managing Director",
    "IT Solution Engineer",
    "Senior HR Generalist",
    "Operation Director"
  ];

  const canManage = employee ? allowedPositions.includes(employee.position || "") : false;

  const now = new Date();

  // Fetch all active elections
  const activeElections = await prisma.elections.findMany({
    where: { is_active: true },
    include: {
      _count: {
        select: { candidates: true }
      },
      votes: {
        where: { voter_id: userId },
        take: 1
      }
    },
    orderBy: { start_date: "asc" },
  });

  const sanitizedUser = {
    firstName: user.firstName,
    username: user.username,
    imageUrl: user.imageUrl,
  };

  // Check registration status (any active registration?)
  const regElection = activeElections.find(e => 
    e.reg_start_date && e.reg_end_date &&
    now >= new Date(e.reg_start_date) && now <= new Date(e.reg_end_date)
  );

  // List of elections open for voting
  const votingOpenElections = activeElections.filter(e => 
    now >= new Date(e.start_date) && 
    now <= new Date(e.end_date)
  );

  // Elections user HAS NOT voted for yet
  const availableVoteElections = votingOpenElections.filter(e => e.votes.length === 0);

  // Is there at least one election open right now?
  const isAnyVotePeriodOpen = votingOpenElections.length > 0;

  // Has the user voted in ALL available active elections?
  const isAllVoted = isAnyVotePeriodOpen && availableVoteElections.length === 0;

  const electionStatus = {
    isRegOpen: !!regElection,
    isVoteOpen: isAnyVotePeriodOpen && !isAllVoted,
    isAllVoted: isAllVoted,
    candidateCount: availableVoteElections.length > 0 ? Math.max(...availableVoteElections.map(e => e._count.candidates)) : 0,
    availableVotes: availableVoteElections.map(e => ({
      id: e.id,
      title: e.title,
      candidateCount: e._count.candidates
    }))
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Header user={sanitizedUser} />
        <MenuView canManage={canManage} electionStatus={electionStatus} />
      </div>
    </div>
  );
}
