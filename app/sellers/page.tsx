"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Sellers() {
  const [sellers, setSellers] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("sellers").select("id,business_name,area,address").eq("status", "approved")
      .then(({ data }) => { if (data) setSellers(data); });
  }, []);
  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-3">
        <h2 className="text-xl font-bold text-blue-900">Sellers Dekho</h2>
        <p className="text-sm text-gray-500">Apne area ke sellers - pasand ka chuno, order karo</p>
        <div className="space-y-3">
          {sellers.map((s) => (
            <div key={s.id} className="gold-card rounded-2xl p-4">
              <p className="font-extrabold text-blue-900 text-lg">{s.business_name}</p>
              <p className="text-sm text-gray-500">{s.area || ""} {s.address ? "- " + s.address : ""}</p>
              <Link href={"/shop/" + s.id} className="gold-btn block text-center text-white font-bold py-2.5 rounded-2xl mt-3">
                Dukkan Kholo
              </Link>
            </div>
          ))}
          {sellers.length === 0 && <p className="text-gray-400 text-sm text-center">Abhi koi seller nahi hai...</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
