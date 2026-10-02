"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getMobile } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Profile(){
  const router = useRouter();
  const [m,setM]=useState<string|null>(null);
  const [p,setP]=useState<any>(null);
  useEffect(()=>{
    const mobile = getMobile();
    setM(mobile);
    if(mobile){
      supabase.from("profiles").select("*").eq("mobile",mobile).maybeSingle()
        .then(({data})=>setP(data));
    }
  },[]);
  const logout=()=>{
    localStorage.removeItem("pw_mobile");
    localStorage.removeItem("pw_seller_id");
    localStorage.removeItem("pw_last_order");
    router.push("/login");
  };

  if(!m){
    return <><Header /><main className="p-6 text-center space-y-3">
      <p>Login nahi kiya</p><Link href="/login" className="gold-btn px-6 py-2 rounded-xl text-white">Login Karo</Link>
    </main><BottomNav /></>
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">Meri Profile</h2>
        <div className="gold-card rounded-2xl p-4 flex gap-4">
          <div className="flex-1">
            <p className="font-extrabold text-blue-900 text-lg">{p?.name || "Customer"}</p>
            <p className="text-sm text-gray-500">+91 {m}</p>
            <p className="text-sm text-gray-500">{p?.address || "B-2-304, Arihant Anchal, Jodhpur"}</p>
          </div>
        </div>

        <Link href="/orders" className="border-2 rounded-2xl p-3 flex gap-3"><span>🚚</span><span className="flex-1 font-semibold">Mere Orders</span><span>›</span></Link>
        <Link href={"/track/"+(localStorage.getItem("pw_last_order")||"")} className="border-2 rounded-2xl p-3 flex gap-3"><span>📍</span><span className="flex-1 font-semibold">Last Order Track</span><span>›</span></Link>
        <Link href="/seller/login" className="border-2 rounded-2xl p-3 flex gap-3"><span>🏪</span><span className="flex-1 font-semibold">Seller Dashboard</span><span>›</span></Link>

        <button onClick={logout} className="border-2 border-red-200 w-full rounded-2xl p-3 flex gap-3">
          <span>🚪</span><span className="flex-1 font-semibold text-red-600 text-left">Logout</span><span>›</span>
        </button>
      </main>
      <BottomNav />
    </>
  )
}
