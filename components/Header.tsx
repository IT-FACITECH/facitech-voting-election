import Image from "next/image";

interface HeaderProps {
  user: {
    firstName?: string | null;
    username?: string | null;
    imageUrl: string;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-white">เลือกตั้งคณะกรรมการประจำปี 2026</h1>
        <p className="text-white/80">Welcome, {user.firstName || user.username || 'Voter'}</p>
      </div>
      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm">
        <Image src={user.imageUrl} alt="Profile" width={48} height={48} />
      </div>
    </header>
  );
}
