"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function ThankYou() {
  return (
    <div className="bg-white dark:bg-zinc-900 p-12 rounded-2xl text-center border dark:border-zinc-800">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">ขอบคุณสำหรับการลงคะแนน</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">คุณได้ใช้สิทธิ์ไปแล้ว (You have already used your right).</p>
      
      <div className="flex justify-center pt-4">
        <SignOutButton>
          <button className="px-8 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-bold hover:scale-105 active:scale-95 transition-all">
            Logout
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
