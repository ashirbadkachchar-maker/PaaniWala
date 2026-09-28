"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBuyerProfile, type BuyerProfile } from "@/lib/supabase";

export default function ProfileCard() {
  const [profile, setProfile] = useState<BuyerProfile | null>(null);

  useEffect(() => {
    getBuyerProfile().then(setProfile);
  }, []);

  return (
    <div className="gold-card rounded-2xl p-4 flex items-center gap-4">
      <Image src="/pagdi.png" alt="profile" width={64} height={64} className="object-contain rounded-full bg-amber-50 p-1" />
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-blue-900 text-lg">{profile?.name || "Naam nahi jodha"}</p>
        <p className="text-sm text-gray-500">{profile?.mobile ? "+91 " + profile.mobile : ""}</p>
        <p className="text-sm text-gray-500">{profile?.address || "Pata nahi jodha"}</p>
      </div>
      <Link href="/address" className="text-amber-600 text-sm font-bold">Edit Karo</Link>
    </div>
  );
}
