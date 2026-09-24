"use client";
import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

const times = ["Aaj Subah 8 Baje", "Aaj Shaam 5 Baje", "Kal Subah 8 Baje"];

export default function Camper() {
  const [qty, setQty] = useState(2);
  const [time, setTime] = useState(times[0]);
  const total = qty * 40;
  const disc = Math.round(total * 0.2);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">← Camper Order Karo</h2>

        <div className="gold-card rounded-2xl p-4 text-center">
          <div className="text-6xl">🫙</div>
          <p className="font-bold text-blue-900 mt-2">Shuddh Paani - 20L Camper</p>
          <p className="text-gray-500 text-sm">Rs 40/can</p>
        </div>

        <div className="flex items-center justify-center gap-6 py-1">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-14 h-14 rounded-full gold-btn text-white text-3xl font-bold">−</button>
          <span className="text-2xl font-extrabold text-blue-900">{qty} Camper</span>
          <button onClick={() => setQty(qty + 1)} className="w-14 h-14 rounded-full gold-btn text-white text-3xl font-bold">+</button>
        </div>

        <div>
          <p className="font-semibold text-blue-900 mb-2">Delivery Time</p>
          <div className="flex flex-wrap gap-2">
            {times.map((t) => (
              <button key={t} onClick={() => setTime(t)} className={`chip ${time === t ? "chip-on" : "chip-off"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>📍 B-2-304, Arihant Anchal, Jodhpur</span>
          <Link href="/address" className="text-blue-600 font-semibold">Badlo</Link>
        </div>

        <p className="text-sm">🏷️ PAANI20 lagaya gaya - 20% chhoot</p>

        <div className="border-2 border-gray-200 rounded-2xl p-4 text-sm space-y-1">
          <div className="flex justify-between"><span>{qty} Camper</span><span>Rs {total}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="text-green-600 font-semibold">FREE</span></div>
          <div className="flex justify-between"><span>Chhoot</span><span>- Rs {disc}</span></div>
          <div className="flex justify-between font-extrabold text-blue-900 text-base pt-1 border-t">
            <span>Kul</span><span>Rs {total - disc}</span>
          </div>
        </div>

        <Link href="/success" className="gold-btn block text-center text-white text-lg font-bold py-3 rounded-2xl">
          💧 Order Karo
        </Link>
      </main>
      <BottomNav />
    </>
  );
}
