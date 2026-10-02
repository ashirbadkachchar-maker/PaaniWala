"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { getMobile } from "@/lib/supabase";

export default function Success() {
  const [orderId, setOrderId] = useState("");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    setOrderId(localStorage.getItem("pw_last_order") || "");
    setMobile(getMobile() || "");
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-4xl text-white">✓</div>
        <h2 className="text-2xl font-extrabold text-blue-900">Order Successful!</h2>
        <p className="text-sm text-gray-500">Paani wala raste me hai</p>

        <div className="gold-card rounded-2xl p-5 w-full space-y-2">
          <p className="text-xs text-gray-500">Order ID</p>
          <p className="font-extrabold text-blue-900 tracking-widest">{orderId || "PW-XXXX"}</p>
          <p className="text-xs text-gray-500">Mobile: +91 {mobile}</p>
          <p className="text-xs text-green-600 font-semibold mt-2">Seller ko notification chala gaya hai</p>
        </div>

        <div className="w-full space-y-2 pt-2">
          <Link href="/home" className="gold-btn block text-center text-white font-bold py-3 rounded-2xl">
            Aur Order Karo
          </Link>
          <Link href="/orders" className="block text-center border-2 border-gray-200 rounded-2xl py-3 font-bold text-blue-900">
            Mere Orders Dekho
          </Link>
        </div>

        <p className="text-xs text-gray-400">Koi problem ho to seller ko call karo</p>
      </main>
      <BottomNav />
    </>
  );
}
