"use client";
import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const upiApps = ["GPay", "PhonePe", "Paytm"];
const bills = [
  { month: "September 2026", amt: 128, paid: false },
  { month: "August 2026", amt: 112, paid: true },
  { month: "July 2026", amt: 80, paid: true },
];

export default function Bills() {
  const [upi, setUpi] = useState(upiApps[0]);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">← Mere Bills</h2>

        <div className="gold-card rounded-2xl p-4">
          <p className="text-sm text-gray-500">Kul Bakaaya</p>
          <p className="text-3xl font-extrabold text-blue-900">Rs 320</p>
          <p className="text-sm mt-1">Is Mahine: Rs 128</p>
          <button className="gold-btn text-white font-bold px-5 py-2 rounded-full mt-2 text-sm">Sab Pay Karo</button>
        </div>

        <div className="gold-card rounded-2xl p-4">
          <p className="font-bold text-blue-900 mb-2">💳 UPI se Bhugtan</p>
          <div className="flex gap-2 mb-3">
            {upiApps.map((a) => (
              <button key={a} onClick={() => setUpi(a)} className={`chip ${upi === a ? "chip-on" : "chip-off"}`}>
                {a}
              </button>
            ))}
          </div>
          <input className="input-gold text-sm" placeholder="UPI ID likho (jaise naam@upi)" />
          <button className="gold-btn w-full text-white font-bold py-2.5 rounded-2xl mt-3">UPI se Pay Karo</button>
        </div>

        <div className="space-y-3">
          {bills.map((b) => (
            <div key={b.month} className="border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-blue-900">{b.month}</p>
                <p className="text-sm text-gray-500">Rs {b.amt}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${b.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {b.paid ? "Bhugtan Ho Gaya" : "Bakaaya"}
                </span>
                {!b.paid && <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Pay Karo</button>}
                <span className="text-gray-400">⬇</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
