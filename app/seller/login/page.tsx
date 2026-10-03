"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SellerLogin() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    setErr("");
    const clean = mobile.replace(/\D/g,"").slice(-10);
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
      <main className="flex-1 p-5 space-y-5 max-w-md mx-auto bg-[#fffaf0] min-h-screen">
        <Link href="/home" className="text-[#2b5bd7] font-bold text- flex items-center gap-1">← Home</Link>

        {/*? wala box hata diya, emoji add kiya */}
        <h1 className="text- font-extrabold text-[#1e3a8a]">🏪 Seller Login</h1>

        <div className="space-y-4 pt-2">
          <div>
            <label className="font-bold text-[#1e3a8a] text-">Mobile Number</label>
            <div className="mt-2 flex items-center gap-3 border-2 border-[#e8a531] rounded-2xl px-4 py-4 bg-white">
              <span className="font-extrabold text-[#1e3a8a] border-r-2 border-[#f6c33a] pr-3">+91</span>
              <input
                className="flex-1 outline-none font-bold text-gray-700 placeholder:text-gray-400"
                placeholder="98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1e3a8a] text-">Password</label>
            <input
              className="mt-2 w-full border-2 border-[#e8a531] rounded-2xl px-4 py-4 outline-none font-medium placeholder:text-gray-400 bg-white"
              type="password"
              placeholder="Register ke time wala password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {err && <p className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-xl text-center">{err}</p>}

          <button onClick={doLogin} disabled={loading} className="w-full bg-gradient-to-r from-[#f6c33a] to-[#d98e28] text-white font-extrabold text- py-4 rounded-2xl shadow disabled:opacity-60">
            {loading? "Ruko..." : "Seller Login"}
          </button>

          <p className="text-center text-gray-500 text-">
            Naye seller? <Link href="/seller/register" className="text-[#2b5bd7] font-extrabold">Register karo</Link>
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
