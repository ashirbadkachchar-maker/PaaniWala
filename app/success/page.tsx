"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Success() {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const oid = localStorage.getItem("pw_last_order");
    if (!oid) return;
    supabase.from("orders").select("*").eq("order_id", oid).single().then(({ data }) => {
      if (data) setOrder(data);
    });
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full gold-btn flex items-center justify-center text-5xl text-white">✓</div>
        <h2 className="text-2xl font-extrabold text-blue-900">Order Mil Gaya!</h2>
        <p className="text-gray-500">Dhanyavaad Ramesh Ji 🎉</p>

        <div className="gold-card rounded-2xl p-4 w-full text-left text-sm space-y-1">
          <div className="flex justify-between"><span>Order ID</span><span className="font-bold">{order ? order.order_id : "..."}</span></div>
          <div className="flex justify-between"><span>Items</span><span>{order ? order.item_name : "..."}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{order ? order.delivery_slot : "..."}</span></div>
          <div className="flex justify-between font-extrabold text-blue-900 pt-1 border-t">
            <span>Kul Bhugtan</span><span>Rs {order ? order.total : "..."}</span>
          </div>
        </div>

        <Link href="/track" className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">Track Karo</Link>
        <Link href="/home" className="w-full border-2 border-blue-900 text-blue-900 font-bold py-3 rounded-2xl">Home Jao</Link>
      </main>
      <BottomNav />
    </>
  );
}
