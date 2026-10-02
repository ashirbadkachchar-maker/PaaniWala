"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const buyerTabs = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/sellers", label: "Sellers", icon: "🏪" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

const sellerTabs = [
  { href: "/seller/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/seller/orders", label: "Orders", icon: "📦" },
  { href: "/seller/products", label: "Products", icon: "🧴" },
  { href: "/seller/profile", label: "Profile", icon: "👤" },
];

const adminTabs = [
  { href: "/admin", label: "Admin", icon: "🛡️" },
  { href: "/admin/sellers", label: "Sellers", icon: "✅" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav(){
  const pathname = usePathname();
  const [role, setRole] = useState<"buyer"|"seller"|"admin">("buyer");

  useEffect(()=>{
    const isSeller = localStorage.getItem("pw_seller_id");
    const isAdmin = localStorage.getItem("pw_admin_id") || localStorage.getItem("pw_admin");
    if(isAdmin) setRole("admin");
    else if(isSeller) setRole("seller");
    else setRole("buyer");
  },[pathname]);

  const tabs = role === "seller"? sellerTabs : role === "admin"? adminTabs : buyerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 flex justify-around py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      {tabs.map(t=>{
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link key={t.href} href={t.href} className={`flex flex-col items-center gap-0.5 text- min-w- py-1 rounded-xl ${active? "text-blue-900 font-extrabold bg-amber-50" : "text-gray-400"}`}>
            <span className="text-xl leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        )
      })}
    </nav>
  );
}
