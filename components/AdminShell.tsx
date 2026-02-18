"use client";

import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {children}
      <Footer onBookClick={() => router.push("/")} />
    </div>
  );
}
