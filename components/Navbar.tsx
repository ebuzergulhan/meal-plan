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
      <nav className="sticky top-0 z-50 border-b border-[#1e1e2a] bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#a3e635]">
              <Zap size={13} className="text-black" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Yemek <span className="text-[#a3e635]">Programi</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-[#a3e635]/10 text-[#a3e635]" : "text-[#9090a8] hover:text-white"
                  }`}
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1e1e2a] bg-[#0a0a0f]/90 backdrop-blur-md sm:hidden">
        <div className="flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                  active ? "text-[#a3e635]" : "text-[#3f3f52]"
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
