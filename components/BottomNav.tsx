"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// 1. BINA LOGIN KE — sirf ye 3 dikhenge (tera purana wala)
const publicTabs = [
  { href: "/home", label: "Home", icon: "🏠", match: ["/", "/home"] },
  { href: "/login", label: "Buyer", icon: "👤", match: ["/login"] },
  { href: "/seller/login", label: "Seller", icon: "🏪", match: ["/seller/login", "/seller/register"] },
];

// 2. BUYER LOGIN KE BAAD
const buyerTabs = [
  { href: "/home", label: "Home", icon: "🏠", match: ["/home", "/"] },
  { href: "/sellers", label: "Sellers", icon: "🏪", match: ["/sellers", "/shop"] },
  { href: "/orders", label: "Orders", icon: "📦", match: ["/orders", "/order"] },
  { href: "/profile", label: "Profile", icon: "👤", match: ["/profile"] },
];

// 3. SELLER LOGIN KE BAAD
const sellerTabs = [
  { href: "/seller/dashboard", label: "Dashboard", icon: "📊", match: ["/seller/dashboard"] },
  { href: "/seller/orders", label: "Orders", icon: "📦", match: ["/seller/orders"] },
  { href: "/seller/products", label: "Products", icon: "🧴", match: ["/seller/products"] },
  { href: "/seller/profile", label: "Profile", icon: "👤", match: ["/seller/profile"] },
];

const adminTabs = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🛡️", match: ["/admin/dashboard"] },
  { href: "/admin/sellers", label: "Sellers", icon: "✅", match: ["/admin/sellers"] },
  { href: "/admin/orders", label: "Orders", icon: "📦", match: ["/admin/orders"] },
  { href: "/admin/commission", label: "Commission", icon: "💰", match: ["/admin/commission"] },
];

const HIDE_ON = ["/login", "/seller/login", "/seller/register", "/admin/login"];

export default function BottomNav(){
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [tabs, setTabs] = useState(publicTabs);

  useEffect(()=>{
    setMounted(true);

    // Login pages par nav bilkul mat dikhao - jump rokne ke liye
    if(HIDE_ON.some(r => pathname === r || pathname.startsWith(r + "/"))){
      return;
    }

    const buyer = localStorage.getItem("pw_mobile");
    const seller = localStorage.getItem("pw_seller_id");
    const admin = localStorage.getItem("pw_admin") || localStorage.getItem("pw_admin_token");

    if(pathname.startsWith("/admin") && admin){
      setTabs(adminTabs);
    } else if(pathname.startsWith("/seller") && seller){
      setTabs(sellerTabs);
    } else if(seller){
      // seller login hai to kahin bhi seller wala nav
      setTabs(sellerTabs);
    } else if(buyer){
      // buyer login hai to buyer wala nav
      setTabs(buyerTabs);
    } else {
      // koi login nahi — sirf Home | Buyer | Seller
      setTabs(publicTabs);
    }
  },[pathname]);

  if(!mounted) return null;

  // Login page par hide
  if(HIDE_ON.some(r => pathname === r || pathname.startsWith(r + "/"))){
    return null;
  }

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
