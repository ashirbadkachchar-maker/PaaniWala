"use client";
import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function Plans() {
  const [msg, setMsg] = useState("");

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">← Mere Plans</h2>

        <div className="gold-card rounded-2xl p-4 bg-amber-50">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Sakriya</span>
          <p className="font-extrabold text-blue-900 text-lg mt-2">Monthly Camper Plan</p>
          <p className="text-sm text-gray-500">30 Camper / Mahina - Rs 999</p>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1"><span>12/30 istemal</span><span>Valid: 15 Oct tak</span></div>
            <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full gold-btn rounded-full" style={{ width: "40%" }} />
            </div>
          </div>
        </div>

        <p className="font-bold text-blue-900">Aur Plans</p>

        {[
          { name: "Weekly Plan", desc: "8 Camper - Rs 280" },
          { name: "Yearly Plan", desc: "360 Camper - Rs 11,500" },
        ].map((p) => (
          <div key={p.name} className="border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-blue-900">{p.name}</p>
              <p className="text-sm text-gray-500">{p.desc}</p>
            </div>
            <button onClick={() => setMsg(p.name + " chuna gaya!")} className="gold-btn text-white text-sm font-bold px-4 py-2 rounded-full">
              Plan Lo
            </button>
          </div>
        ))}

        {msg && <p className="text-center text-green-700 font-semibold text-sm">✓ {msg}</p>}
      </main>
      <BottomNav />
    </>
  );
}
