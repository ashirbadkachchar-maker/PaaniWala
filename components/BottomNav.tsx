"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", label: "Home", icon: "🏠", color: "text-blue-600" },
  { href: "/plans", label: "Plans", icon: "📦", color: "text-orange-500" },
  { href: "/bills", label: "Bills", icon: "🧾", color: "text-green-600" },
  { href: "/profile", label: "Profile", icon: "👤", color: "text-purple-600" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="grid grid-cols-4 border-t-2 border-amber-200 bg-white sticky bottom-0">
      {items.map((it) => {
        const on = path === it.href;
        return (
          <Link key={it.href} href={it.href} className="flex flex-col items-center py-2">
            <span className={`text-2xl ${on ? it.color : "text-gray-300"}`}>{it.icon}</span>
            <span className={`text-xs font-semibold ${on ? it.color : "text-gray-400"}`}>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
