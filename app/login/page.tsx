"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/home";
  const [tab, setTab] = useState<"otp" | "password">("otp");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [mobile, setMobile] = useState("");
  const [pwMobile, setPwMobile] = useState("");
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 1);
    const digits = [...otp];
    digits[i] = d;
    setOtp(digits);
  };

  const doLogin = async () => {
    const clean = mobile.replace(/\D/g, "").slice(-10);
    if (clean.length < 10) return;
    localStorage.setItem("pw_mobile", clean);
    router.push(nextUrl);
  };

  const doPasswordLogin = async () => {
    setPwErr("");
    const clean = pwMobile.replace(/\D/g, "").slice(-10);
    if (clean.length < 10) { setPwErr("Sahi mobile number dalo"); return; }
    if (!pw) { setPwErr("Password dalo"); return; }
    setPwLoading(true);
    const { data } = await supabase.from("profiles").select("id,password").eq("mobile", clean).maybeSingle();
    setPwLoading(false);
    if (!data) { setPwErr("Ye mobile registered nahi hai - pehle OTP se login karo"); return; }
    if (!data.password) { setPwErr("Aapka password abhi nahi bana - pehla order karo"); return; }
    if (data.password !== pw) { setPwErr("Galat password"); return; }
    localStorage.setItem("pw_mobile", clean);
    router.push(nextUrl);
  };

  return (
    <main className="flex-1 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Image src="/pagdi.png" alt="PaaniWala" width={40} height={40} className="object-contain" />
        <span className="text-2xl font-extrabold text-blue-900">PaaniWala</span>
      </div>
      <h2 className="text-2xl font-extrabold text-blue-900 pt-2">Login Karo</h2>
      {nextUrl !== "/home" && <p className="text-center text-sm font-bold text-amber-600 bg-amber-50 rounded-xl py-2">Order ke liye login karo</p>}
      <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-2xl p-1">
        <button onClick={() => setTab("otp")} className={"py-2.5 rounded-xl font-bold text-sm " + (tab === "otp" ? "bg-white text-blue-900 shadow" : "text-gray-500")}>OTP se</button>
        <button onClick={() => setTab("password")} className={"py-2.5 rounded-xl font-bold text-sm " + (tab === "password" ? "bg-white text-blue-900 shadow" : "text-gray-500")}>Password se</button>
      </div>
      {tab === "otp" ? (
        <>
          <div className="text-center text-6xl py-2">📲</div>
          <div><label className="font-semibold text-blue-900">Mobile Number</label><div className="input-gold flex items-center gap-2 mt-1"><span className="font-bold text-blue-900 border-r-2 border-amber-300 pr-2">+91</span><input className="flex-1 outline-none font-bold text-blue-900" placeholder="98765 43210" value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="numeric" /></div></div>
          <div><label className="font-semibold text-blue-900 block text-center">OTP</label><div className="flex justify-center gap-3 mt-2">{otp.map((d, i) => (<input key={i} value={d} onChange={(e) => setDigit(i, e.target.value)} inputMode="numeric" maxLength={1} className="w-14 h-14 text-center text-2xl font-extrabold text-blue-900 gold-card rounded-2xl outline-none" />))}</div><p className="text-center text-xs text-gray-400 mt-2">Demo: koi bhi 4 digit</p></div>
          <button onClick={doLogin} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">Login Karo</button>
        </>
      ) : (
        <>
          <div className="flex justify-center py-2"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg></div>
          <div><label className="font-semibold text-blue-900">Mobile Number</label><div className="input-gold flex items-center gap-2 mt-1"><span className="font-bold text-blue-900 border-r-2 border-amber-300 pr-2">+91</span><input className="flex-1 outline-none font-bold text-blue-900" placeholder="98765 43210" value={pwMobile} onChange={(e) => setPwMobile(e.target.value)} inputMode="numeric" /></div></div>
          <div><label className="font-semibold text-blue-900">Password</label><input className="input-gold mt-1" type="password" placeholder="Order ke baad mila password" value={pw} onChange={(e) => setPw(e.target.value)} inputMode="numeric" /></div>
          {pwErr && <p className="text-red-500 text-sm font-semibold text-center">{pwErr}</p>}
          <button onClick={doPasswordLogin} disabled={pwLoading} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-60">{pwLoading ? "Ruko..." : "Password se Login"}</button>
        </>
      )}
      <p className="text-center text-xs text-gray-400 mt-4">Bina login ke Home aur Sellers dekh sakte ho</p>
    </main>
  );
}
export default function Login() {
  return <Suspense fallback={<main className="flex-1 p-5"><p className="text-center text-gray-400">Loading...</p></main>}><LoginForm /></Suspense>;
}
