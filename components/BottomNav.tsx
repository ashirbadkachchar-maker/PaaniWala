"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const buyerTabs = [
  { href: "/home", label: "Home", icon: "🏠", match: ["/home", "/"] },
  { href: "/sellers", label: "Sellers", icon: "🏪", match: ["/sellers", "/shop"] },
  { href: "/orders", label: "Orders", icon: "📦", match: ["/orders", "/order"] },
  { href: "/profile", label: "Profile", icon: "👤", match: ["/profile", "/login"] },
];
const sellerTabs = [
  { href: "/seller/dashboard", label: "Dashboard", icon: "📊", match: ["/seller/dashboard"] },
  { href: "/seller/orders", label: "Orders", icon: "📦", match: ["/seller/orders"] },
  { href: "/seller/products", label: "Products", icon: "🧴", match: ["/seller/products"] },
  { href: "/seller/profile", label: "Profile", icon: "👤", match: ["/seller/profile"] },
];
const adminTabs = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🛡️", match: ["/admin/dashboard", "/admin"] },
  { href: "/admin/sellers", label: "Sellers", icon: "✅", match: ["/admin/sellers"] },
  { href: "/admin/orders", label: "Orders", icon: "📦", match: ["/admin/orders"] },
  { href: "/admin/commission", label: "Commission", icon: "💰", match: ["/admin/commission"] },
];

export default function BottomNav(){
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [tabs, setTabs] = useState(buyerTabs);

  useEffect(()=>{
    setMounted(true);
    if(pathname.startsWith("/admin")) setTabs(adminTabs);
    else if(pathname.startsWith("/seller")) setTabs(sellerTabs);
    else setTabs(buyerTabs);
  },[pathname]);

  if(!mounted) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 flex justify-around py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-50">
      {tabs.map(t=>{
        const active = t.match.some(m => pathname === m || pathname.startsWith(m + "/"));
        return (
          <Link key={t.href} href={t.href} className={`flex flex-col items-center gap-0.5 text-[11px] ${active? "text-blue-900 font-extrabold" : "text-gray-400"}`}>
            <span className="text-xl leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        )
      })}
    </nav>
  );
}
