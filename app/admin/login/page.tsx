"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Pogrešna lozinka");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Nešto je pošlo po zlu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a1a] px-4">
      <div className="w-full max-w-md rounded-[24px] border-2 border-white/10 bg-white/3 backdrop-blur-sm p-10 shadow-2xl">
        <div className="mb-10 text-center">
          <h1 className="font-heading text-[36px] text-white md:text-[42px] lg:text-[48px]">
            ADMIN PRIJAVA
          </h1>
          <span className="mt-4 mx-auto block h-[3px] w-16 bg-[#D4AF37] origin-center" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="mb-3 block font-heading text-[11px] uppercase tracking-widest text-[#D4AF37]">
              Lozinka
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[52px] rounded-full border-2 border-white/20 bg-[#1a1a1a] px-6 py-3 text-white placeholder:text-white/40 transition-all duration-300 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
              placeholder="Unesite lozinku"
              autoFocus
            />
          </label>
          {error && (
            <div className="rounded-full border-2 border-red-500/50 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full min-h-[52px] rounded-full bg-[#D4AF37] py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-[#1a1a1a] transition-all duration-300 hover:bg-[#c9a430] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "PRIJAVLJIVANJE..." : "PRIJAVI SE"}
          </button>
        </form>
        <p className="mt-8 text-center">
          <Link
            href="/"
            className="text-[12px] font-medium tracking-wider text-white/60 hover:text-[#D4AF37] transition-colors duration-300"
          >
            &larr; Nazad na sajt
          </Link>
        </p>
      </div>
    </div>
  );
}
