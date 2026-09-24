"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase, getMobile } from "@/lib/supabase";

const upiApps = ["GPay", "PhonePe", "Paytm"];

export default function Bills() {
  const [upi, setUpi] = useState(upiApps[0]);
  const [bills, setBills] = useState<any[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from("bills").select("*").eq("mobile", getMobile())
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setBills(data); });
  }, []);

  const due = bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);

  const payBill = async (id: string) => {
    await supabase.from("bills").update({ paid: true, paid_at: new Date().toISOString() }).eq("id", id);
    setBills(bills.map((b) => (b.id === id ? { ...b, paid: true } : b)));
  };

  const payAll = async () => {
    await supabase.from("bills").update({ paid: true, paid_at: new Date().toISOString() })
      .eq("mobile", getMobile()).eq("paid", false);
    setBills(bills.map((b) => ({ ...b, paid: true })));
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">← Mere Bills</h2>

        <div className="gold-card rounded-2xl p-4">
          <p className="text-sm text-gray-500">Kul Bakaaya</p>
          <p className="text-3xl font-extrabold text-blue-900">Rs {due}</p>
          <button onClick={payAll} className="gold-btn text-white font-bold px-5 py-2 rounded-full mt-2 text-sm">
            Sab Pay Karo
          </button>
          {done && <p className="text-green-700 text-sm font-semibold mt-2">✓ Bhugtan safal!</p>}
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
          <button onClick={payAll} className="gold-btn w-full text-white font-bold py-2.5 rounded-2xl mt-3">
            UPI se Pay Karo
          </button>
        </div>

        <div className="space-y-3">
          {bills.map((b) => (
            <div key={b.id} className="border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-blue-900">{b.month}</p>
                <p className="text-sm text-gray-500">Rs {b.amount}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${b.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {b.paid ? "Bhugtan Ho Gaya" : "Bakaaya"}
                </span>
                {!b.paid && (
                  <button onClick={() => payBill(b.id)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    Pay Karo
                  </button>
                )}
              </div>
            </div>
          ))}
          {bills.length === 0 && <p className="text-center text-gray-400 text-sm">Bills load ho rahe hain...</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
