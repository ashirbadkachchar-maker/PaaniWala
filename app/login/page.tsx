"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BuyerLogin() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const clean = (m:string) => m.replace(/\D/g,"").slice(-10);

  const doLogin = async () => {
    setErr("");
    const c = clean(mobile);
    if(c.length!==10) return setErr("Sahi mobile dalo");
    if(!password) return setErr("Password dalo");
    setLoading(true);
    const { data } = await supabase.from("profiles").select("mobile,password,name").eq("mobile",c).maybeSingle();
    setLoading(false);
    if(!data) return setErr("Ye number registered nahi hai");
    if(data.password!== password.trim()) return setErr("Galat password");
    localStorage.setItem("pw_mobile", c);
    localStorage.setItem("pw_buyer_name", data.name || "");
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-[#fffaf0]">
      <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-amber-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💧</span>
          <span className="text- font-extrabold text-[#1e3a8a]">PaaniWala</span>
        </div>
        <Link href="/login" className="bg-gradient-to-r from-[#f6c33a] to-[#d98e28] text-white font-bold px-5 py-2 rounded-full text-sm">
          Login
        </Link>
      </header>

      <main className="p-5 space-y-5 max-w-md mx-auto">
        <Link href="/home" className="text-[#2b5bd7] font-bold text- flex items-center gap-1">
          ← Home
        </Link>

        <h1 className="text- font-extrabold text-[#1e3a8a]">🛒 Buyer Login</h1>

        <div className="space-y-4 pt-2">
          <div>
            <label className="font-bold text-[#1e3a8a] text-">Mobile Number</label>
            <div className="mt-2 flex items-center gap-3 border-2 border-[#e8a531] rounded-2xl px-4 py-4 bg-white">
              <span className="font-extrabold text-[#1e3a8a] border-r-2 border-[#f6c33a] pr-3">+91</span>
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="98765 43210" inputMode="numeric" className="flex-1 outline-none font-bold text-gray-600 placeholder:text-gray-400" />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1e3a8a] text-">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Register ke time wala password" type="password" className="mt-2 w-full border-2 border-[#e8a531] rounded-2xl px-4 py-4 outline-none font-medium placeholder:text-gray-400" />
          </div>

          {err && <p className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-xl text-center">{err}</p>}

          <button onClick={doLogin} disabled={loading} className="w-full bg-gradient-to-r from-[#f6c33a] to-[#d98e28] text-white font-extrabold text- py-4 rounded-2xl shadow">
            {loading? "Ruko..." : "Buyer Login"}
          </button>

          <p className="text-center text-gray-500 text-">
            Naye buyer? <Link href="/buyer/register" className="text-[#2b5bd7] font-extrabold">Register karo</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
