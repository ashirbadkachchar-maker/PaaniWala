"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SellerLogin() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const login = async () => {
    setErr("");
    const { data } = await supabase.from("sellers")
      .select("id,status").eq("mobile", mobile.replace(/\D/g, "")).eq("password", pw).single();
    if (!data) { setErr("Galat mobile ya password"); return; }
    if (data.status !== "approved") { setErr("Abhi admin approval baki hai"); return; }
    localStorage.setItem("pw_seller_id", data.id);
    router.push("/seller/dashboard");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
      <Image src="/pagdi.png" alt="logo" width={80} height={80} className="object-contain" />
      <h2 className="text-2xl font-extrabold text-blue-900">Seller Login</h2>
      <div className="w-full space-y-3">
        <input className="input-gold" placeholder="Mobile Number" inputMode="numeric" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        <input className="input-gold" placeholder="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </div>
      {err && <p className="text-red-500 text-sm font-semibold">{err}</p>}
      <button onClick={login} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">Login Karo</button>
      <p className="text-sm text-gray-500">Naye seller ho? <Link href="/seller/register" className="text-blue-600 font-bold">Register Karo</Link></p>
    </main>
  );
}
