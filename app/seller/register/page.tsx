"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SellerRegister() {
  const [form, setForm] = useState({
    business_name: "", owner_name: "", mobile: "", password: "",
    area: "", address: "", camper_rate: "40", tanker_rate: "1200",
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setForm({...form, [k]: v });

  const takeLocation = () => {
    if (!("geolocation" in navigator)) {
      setErr("Aapka browser location support nahi karta");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocLoading(false);
        setErr("");
      },
      () => {
        setLocLoading(false);
        setErr("Location allow karo — bina location ke aap list me neeche dikhoge");
      },
      { timeout: 10000 }
    );
  };

  const submit = async () => {
    setErr("");
    if (!form.business_name ||!form.owner_name ||!form.mobile ||!form.password) {
      setErr("Saare zaroori fields bharo");
      return;
    }
    const { error } = await supabase.from("sellers").insert({
      business_name: form.business_name,
      owner_name: form.owner_name,
      mobile: form.mobile.replace(/\D/g, ""),
      password: form.password,
      area: form.area,
      address: form.address,
      lat: coords?.lat?? null,
      lng: coords?.lng?? null,
      camper_rate: parseInt(form.camper_rate) || 40,
      tanker_rate: parseInt(form.tanker_rate) || 1200,
      rating: 4.0,
      status: "pending",
      commission_rate: 5,
    });
    if (error) { setErr("Ye mobile pehle se registered hai"); return; }
    setDone(true);
  };

  if (done) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-20 h-20 rounded-full gold-btn flex items-center justify-center text-4xl text-white">✓</div>
        <h2 className="text-xl font-extrabold text-blue-900">Registration Ho Gayi!</h2>
        <p className="text-gray-500 text-sm">Admin approval ke baad aap login kar paoge. Hum jald sampark karenge.</p>
        <Link href="/seller" className="gold-btn text-white font-bold px-6 py-3 rounded-2xl">Login Page Jao</Link>
      </main>
    );
  }

  return (
    <main className="flex-1 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Image src="/pagdi.png" alt="logo" width={40} height={40} className="object-contain" />
        <span className="text-2xl font-extrabold text-blue-900">PaaniWala</span>
      </div>
      <h2 className="text-2xl font-extrabold text-blue-900">Seller Bano</h2>
      <p className="text-sm text-gray-500">Register karo, admin approval pao, orders lo - har order par sirf 5% service charge</p>
      <input className="input-gold" placeholder="Dukkan/Business ka Naam *" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} />
      <input className="input-gold" placeholder="Aapka Naam *" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} />
      <input className="input-gold" placeholder="Mobile Number *" inputMode="numeric" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
      <input className="input-gold" placeholder="Password *" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
      <input className="input-gold" placeholder="Area (jaise Arihant Anchal)" value={form.area} onChange={(e) => set("area", e.target.value)} />
      <input className="input-gold" placeholder="Poora Pata" value={form.address} onChange={(e) => set("address", e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500">Camper Rate (₹/can)</label>
          <input className="input-gold" placeholder="40" inputMode="numeric" value={form.camper_rate} onChange={(e) => set("camper_rate", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Tanker Rate (₹/tanker)</label>
          <input className="input-gold" placeholder="1200" inputMode="numeric" value={form.tanker_rate} onChange={(e) => set("tanker_rate", e.target.value)} />
        </div>
      </div>

      <button type="button" onClick={takeLocation} disabled={locLoading}
        className={`w-full font-bold py-3 rounded-2xl border-2 ${coords? "border-green-500 text-green-700 bg-green-50" : "border-blue-300 text-blue-700 bg-blue-50"}`}>
        {locLoading? "Location li ja rahi hai..." : coords? "Location mil gayi ✓ (dobara le sakte ho)" : "Current Location lo *"}
      </button>
      <p className="text-xs text-gray-400">* Location se aap nazdeeki customers ko sabse upar dikhoge</p>

      {err && <p className="text-red-500 text-sm font-semibold">{err}</p>}
      <button onClick={submit} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">
        Register Karo
      </button>
      <p className="text-center text-sm text-gray-500">
        Pehle se seller ho? <Link href="/seller" className="text-blue-600 font-bold">Login Karo</Link>
      </p>
    </main>
  );
}
