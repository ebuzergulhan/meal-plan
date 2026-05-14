"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (r.ok) {
        router.push("/dashboard");
      } else {
        const d = await r.json();
        setError(d.error || "Yanlis sifre");
      }
    } catch {
      setError("Baglanti hatasi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Glow */}
      <div className="pointer-events-none fixed left-1/2 top-1/3 -translate-x-1/2 h-64 w-96 rounded-full bg-[#a3e635]/10 blur-[100px]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#a3e635]">
            <Zap size={22} className="text-black" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Yemek Programi
            </h1>
            <p className="mt-1 text-sm text-[#9090a8]">
              Devam etmek icin sifrenizi girin
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#1e1e2a] bg-[#111118] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#9090a8]">
                Sifre
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] py-3 pl-4 pr-11 text-sm text-white placeholder-[#3f3f52] outline-none transition-colors focus:border-[#a3e635]/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3f3f52] hover:text-white transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#a3e635] py-3 text-sm font-bold text-black transition-all hover:bg-[#bef264] active:scale-95 disabled:opacity-60"
            >
              {loading ? "Giris yapiliyor..." : "Giris Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
