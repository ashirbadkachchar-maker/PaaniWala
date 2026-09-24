"use client";
import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";

const types = ["Ghar", "Office", "Dukaan"];

export default function Address() {
  const router = useRouter();
  const [type, setType] = useState(types[0]);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-3">
        <h2 className="text-xl font-bold text-blue-900">← Naya Address Jodo</h2>

        <div className="gold-card rounded-2xl overflow-hidden">
          <div className="bg-blue-50 h-36 flex flex-col items-center justify-center relative">
            <span className="text-4xl">📍</span>
            <p className="text-sm text-gray-500 mt-1">Pin Lagao</p>
            <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-blue-600 text-xl" title="Current location">
              ◎
            </button>
          </div>
        </div>

        <button className="w-full border-2 border-blue-500 text-blue-600 font-semibold py-2 rounded-full text-sm">
          📍 Meri Current Location Istemaal Karo
        </button>

        <div className="space-y-2">
          <div><label className="text-sm font-semibold text-blue-900">Naam</label><input className="input-gold mt-1" defaultValue="Ramesh Ji" /></div>
          <div><label className="text-sm font-semibold text-blue-900">Flat / House No</label><input className="input-gold mt-1" defaultValue="B-2-304" /></div>
          <div><label className="text-sm font-semibold text-blue-900">Area / Mohalla</label><input className="input-gold mt-1" defaultValue="Arihant Anchal" /></div>
          <div><label className="text-sm font-semibold text-blue-900">Landmark</label><input className="input-gold mt-1" defaultValue="Dali Bai Circle ke paas" /></div>
          <div><label className="text-sm font-semibold text-blue-900">Pincode</label><input className="input-gold mt-1" defaultValue="342001" inputMode="numeric" /></div>
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-900 mb-2">Address type</p>
          <div className="flex gap-2">
            {types.map((t) => (
              <button key={t} onClick={() => setType(t)} className={`chip ${type === t ? "chip-on" : "chip-off"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => router.push("/camper")} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">
          Save Karo
        </button>
      </main>
      <BottomNav />
    </>
  );
}
