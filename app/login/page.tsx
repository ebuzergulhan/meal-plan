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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-slate-50">
      {/* Subtle background gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full opacity-10" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", filter: "blur(80px)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-bg shadow-lg shadow-blue-100">
            <Zap size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Yemek <span className="gradient-text">Programi</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Devam etmek icin sifrenizi girin
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Sifre
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg gradient-bg py-3 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              {loading ? "Giris yapiliyor..." : "Giris Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
