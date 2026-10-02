"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/sellers", label: "Sellers", icon: "🏪" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav(){
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 flex justify-around py-2 pb-3 z-50">
      {tabs.map(t=>{
        const active = path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`flex flex-col items-center text-[11px] ${active ? "text-blue-900 font-extrabold" : "text-gray-400"}`}>
            <span className="text-xl">{t.icon}</span>{t.label}
          </Link>
        )
      })}
    </nav>
  )
}
