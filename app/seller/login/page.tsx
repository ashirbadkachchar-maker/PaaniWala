"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SellerLogin() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    setErr("");
    const clean = mobile.replace(/\D/g, "");
    if (clean.length < 10) { setErr("Sahi mobile number dalo"); return; }
    if (!password) { setErr("Password dalo"); return; }
    setLoading(true);
    const { data } = await supabase
    .from("sellers")
    .select("id,business_name,password,status")
    .eq("mobile", clean)
    .maybeSingle();
    setLoading(false);
    if (!data) { setErr("Ye mobile registered nahi hai - pehle seller register karo"); return; }
    if (data.password!== password) { setErr("Galat password"); return; }
    if (data.status!== "approved") { setErr("Aapka account abhi Admin approval me hai"); return; }
    localStorage.setItem("pw_seller_id", data.id);
    localStorage.setItem("pw_seller_name", data.business_name || "Seller");
    router.push("/seller/dashboard");
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-5 space-y-4">
        <Link href="/home" className="text-blue-600 font-semibold text-sm">← Home</Link>
        <div className="flex items-center gap-2">
          <Image src="/pagdi.png" alt="PaaniWala" width={40} height={40} className="object-contain" />
          <span className="text-2xl font-extrabold text-blue-900">Seller Login</span>
        </div>
        <div>
          <label className="font-semibold text-blue-900 text-sm">Mobile Number</label>
          <div className="input-gold flex items-center gap-2 mt-1">
            <span className="font-bold text-blue-900 border-r-2 border-amber-300 pr-2">+91</span>
            <input
              className="flex-1 outline-none font-bold text-blue-900"
              placeholder="98765 43210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>
        <div>
          <label className="font-semibold text-blue-900 text-sm">Password</label>
          <input
            className="input-gold mt-1"
            type="password"
            placeholder="Register ke time wala password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && <p className="text-red-500 text-sm font-semibold text-center">{err}</p>}
        <button onClick={doLogin} disabled={loading} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-60">
          {loading? "Ruko..." : "Seller Login"}
        </button>
        <p className="text-center text-sm text-gray-500">
          Naye seller? <Link href="/seller/register" className="text-blue-600 font-bold">Register karo</Link>
        </p>
      </main>
      <BottomNav />
    </>
  );
}
