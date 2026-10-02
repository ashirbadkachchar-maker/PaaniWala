"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMobile } from "@/lib/supabase";

export default function Header() {
  const [role, setRole] = useState<"guest" | "buyer" | "seller" | "admin">("guest");
  const [label, setLabel] = useState("Login");

  useEffect(() => {
    try {
      const admin = localStorage.getItem("pw_admin") || localStorage.getItem("pw_admin_token");
      const sellerId = localStorage.getItem("pw_seller_id");
      const sellerName = localStorage.getItem("pw_seller_name");
      const mobile = getMobile();

      if (admin) { setRole("admin"); setLabel("Admin"); }
      else if (sellerId) { setRole("seller"); setLabel(sellerName || "Seller"); }
      else if (mobile) { setRole("buyer"); setLabel("Profile"); }
      else { setRole("guest"); setLabel("Login"); }
    } catch { setRole("guest"); }
  }, []);

  const getLink = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "seller") return "/seller/dashboard";
    if (role === "buyer") return "/profile";
    return "/login";
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-amber-100 px-4 py-3 flex items-center justify-between">
      <Link href="/home" className="flex items-center gap-2">
        <Image src="/pagdi.png" alt="PaaniWala" width={32} height={32} className="object-contain" />
        <span className="text-xl font-extrabold text-blue-900 tracking-tight">PaaniWala</span>
      </Link>
      <Link href={getLink()} className={role === "guest" ? "gold-btn text-white text-sm font-bold px-5 py-2 rounded-xl" : "flex items-center gap-2 bg-blue-50 text-blue-900 font-bold text-sm px-4 py-2 rounded-full border border-blue-100"}>
        {role === "admin" && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
        {role === "seller" && <span>🏪</span>}
        {role === "buyer" && <span>👤</span>}
        {label}
      </Link>
    </header>
  );
}
