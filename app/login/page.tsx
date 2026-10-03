"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/home";
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    const clean = mobile.replace(/\D/g, "").slice(-10);
    const cleanPin = pin.replace(/\D/g, "").slice(0, 6);
    if (clean.length < 10) { setErr("Sahi mobile dalo"); return; }
    if (cleanPin.length < 4) { setErr("4-digit PIN dalo"); return; }
    setLoading(true);
    const { data } = await supabase.from("profiles").select("id,password").eq("mobile", clean).maybeSingle();
    setLoading(false);
    if (!data) { setErr("Ye mobile registered nahi hai! Pehle Register karo."); return; }
    if (data.password !== cleanPin) { setErr("Galat PIN!"); return; }
    localStorage.setItem("pw_mobile", clean);
    router.push(nextUrl);
  };

  return (
    <main className="flex-1 p-5 space-y-5 bg-[#FFFBF2] min-h-screen pb-24">
      <Link href="/home" className="text-blue-600 font-bold text-sm">← Home</Link>
      <h2 className="text-2xl font-extrabold text-blue-900">Buyer Login</h2>
      <div className="space-y-4 pt-2">
        <div>
          <label className="font-bold text-blue-900 text-sm">Mobile Number</label>
          <div className="flex items-center gap-2 mt-1 border-2 border-amber-400 rounded-2xl px-4 py-3 bg-white">
            <span className="font-extrabold text-blue-900 border-r-2 border-amber-300 pr-3">+91</span>
            <input className="flex-1 outline-none font-bold text-blue-900" placeholder="98765 43210" value={mobile} onChange={e=>setMobile(e.target.value)} inputMode="numeric" />
          </div>
        </div>
        <div>
          <label className="font-bold text-blue-900 text-sm">4-Digit PIN</label>
          <input className="w-full border-2 border-amber-400 rounded-2xl px-4 py-3 font-bold outline-none bg-white mt-1" type="password" placeholder="****" value={pin} onChange={e=>setPin(e.target.value)} inputMode="numeric" />
        </div>
        {err && <p className="text-red-600 text-sm font-bold text-center bg-red-50 rounded-xl py-2">{err}</p>}
        <button onClick={doLogin} disabled={loading} className="w-full py-3.5 rounded-2xl text-white font-extrabold gold-btn">{loading?"Ruko...":"Login Karo"}</button>
        <Link href={`/register?next=${encodeURIComponent(nextUrl)}`} className="block w-full border-2 border-blue-900 text-blue-900 font-bold py-3 rounded-2xl text-center">Puri Jankari ke Saath Register Karo →</Link>
      </div>
    </main>
  );
}
export default function Login() {
  return <Suspense><LoginForm /></Suspense>
}
