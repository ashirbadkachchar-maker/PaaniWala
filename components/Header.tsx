"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMobile } from "@/lib/supabase";

export default function Header() {
  const [mobile, setMobile] = useState<string | null>(null);

  useEffect(() => {
    try {
      setMobile(getMobile() || null);
    } catch {
      setMobile(null);
    }
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-amber-100 px-4 py-2.5 flex items-center justify-between">
      <Link href="/home" className="flex items-center gap-2">
        <Image src="/pagdi.png" alt="PaaniWala" width={32} height={32} className="object-contain" />
        <span className="text-xl font-extrabold text-blue-900">PaaniWala</span>
      </Link>
      {mobile ? (
        <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-full">
          +91 {mobile}
        </span>
      ) : (
        <Link href="/login" className="gold-btn text-white text-sm font-bold px-4 py-2 rounded-xl">
          Login Karo
        </Link>
      )}
    </header>
  );
}
