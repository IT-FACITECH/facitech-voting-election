import type { Metadata } from "next";
import { Noto_Sans_Thai, Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Facitech เลือกตั้งออนไลน์",
  description: "A simple voting system using Clerk and LINE Login",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="th" className={cn("font-sans", geist.variable)}>
        <body className={`${notoSansThai.className} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
