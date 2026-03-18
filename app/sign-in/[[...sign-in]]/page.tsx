import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <SignIn appearance={{
        elements: {
          formButtonPrimary: 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90',
          footerActionLink: 'text-black dark:text-white hover:underline'
        }
      }} />
    </div>
  );
}
