"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BookOpen, ShoppingCart, Zap, Pizza } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Plan", icon: CalendarDays },
  { href: "/recipes", label: "Tarifler", icon: BookOpen },
  { href: "/shopping", label: "Alisveris", icon: ShoppingCart },
  { href: "/pizza", label: "Pizza", icon: Pizza },
];

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-bg">
              <Zap size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Yemek <span className="gradient-text">Programi</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-0.5">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-blue-600 font-semibold"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  style={active ? { background: "rgba(37,99,235,0.06)" } : {}}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white sm:hidden">
        <div className="flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                  active ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
