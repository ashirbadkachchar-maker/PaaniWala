"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getMobile } from "@/lib/supabase";

const steps = [
  { label: "Order Mil Gaya", state: "done" },
  { label: "Camper Bhara Gaya", state: "done" },
  { label: "Raste Me Hai", state: "now" },
  { label: "Pahunch Gaya", state: "todo" },
];

export default function Track() {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    supabase.from("orders").select("*").eq("mobile", getMobile())
      .order("created_at", { ascending: false }).limit(1).single()
      .then(({ data }) => { if (data) setOrder(data); });
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">← Order Track Karo</h2>

        <div className="gold-card rounded-2xl p-4 text-sm space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-900">Order ID: {order ? order.order_id : "..."}</span>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
              {order ? order.status : "..."}
            </span>
          </div>
          <p>{order ? order.item_name : "..."}</p>
          <p className="text-gray-500">{order ? order.delivery_slot : "..."}</p>
        </div>

        <div className="border-2 border-gray-200 rounded-2xl p-4 bg-blue-50">
          <div className="text-center text-5xl">🗺️</div>
          <p className="text-center text-sm mt-2">📍 Paani Plant <span className="text-amber-500 font-bold">━━━━🚚━━━━</span> 🏠 Ghar</p>
          <p className="text-center mt-2"><span className="gold-btn text-white text-xs font-bold px-3 py-1 rounded-full">15 min me pahunchega</span></p>
        </div>

        <div className="space-y-3">
          {steps.map((s) => (
            <div key={s.label} className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${s.state === "now" ? "gold-card bg-amber-50" : "border-gray-200"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${s.state === "done" ? "bg-green-500 text-white" : s.state === "now" ? "gold-btn text-white" : "bg-gray-200 text-gray-400"}`}>
                {s.state === "done" ? "✓" : s.state === "now" ? "🚚" : "•"}
              </span>
              <span className={`font-semibold ${s.state === "todo" ? "text-gray-400" : "text-blue-900"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-4xl">👨🏽</span>
          <div className="flex-1">
            <p className="font-bold text-blue-900">Ramesh Ji</p>
            <p className="text-sm text-gray-500">Delivery Partner</p>
          </div>
          <button className="bg-blue-600 text-white text-sm font-bold px-3 py-2 rounded-full">📞 Call Karo</button>
          <button className="bg-green-600 text-white text-sm font-bold px-3 py-2 rounded-full">💬</button>
        </div>

        <Link href="/home" className="block text-center text-blue-600 font-semibold text-sm">← Home Jao</Link>
      </main>
      <BottomNav />
    </>
  );
}
