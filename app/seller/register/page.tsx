"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SellerRegister() {
  const [form, setForm] = useState({ business_name: "", owner_name: "", mobile: "", password: "", area: "", address: "" });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = async () => {
    setErr("");
    if (!form.business_name || !form.owner_name || !form.mobile || !form.password) {
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
