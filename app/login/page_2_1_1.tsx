"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [otp, setOtp] = useState(["4", "2", "", ""]);
  const [mobile, setMobile] = useState("98765 43210");

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
  };

  const doLogin = async () => {
    const clean = mobile.replace(/\D/g, "");
    localStorage.setItem("pw_mobile", clean);
    // profile save/update
    await supabase.from("profiles").upsert(
      { mobile: clean, name: "Ramesh Ji", address: "B-2-304, Arihant Anchal, Jodhpur" },
      { onConflict: "mobile" }
    );
    router.push("/home");
  };

  return (
    <main className="flex-1 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Image src="/pagdi.png" alt="PaaniWala" width={40} height={40} className="object-contain" />
        <span className="text-2xl font-extrabold text-blue-900">PaaniWala</span>
      </div>

      <h2 className="text-2xl font-extrabold text-blue-900 pt-2">Login Karo</h2>
      <div className="text-center text-6xl py-2">📲</div>

      <div>
        <label className="font-semibold text-blue-900">Mobile Number</label>
        <div className="input-gold flex items-center gap-2 mt-1">
          <span className="font-bold text-blue-900 border-r-2 border-amber-300 pr-2">+91</span>
          <input
            className="flex-1 outline-none font-bold text-blue-900"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="numeric"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-blue-900 block text-center">OTP</label>
        <div className="flex justify-center gap-3 mt-2">
          {otp.map((d, i) => (
            <input
              key={i}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="w-14 h-14 text-center text-2xl font-extrabold text-blue-900 gold-card rounded-2xl outline-none"
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-2">⏱ OTP dobara bhejo - 0:25</p>
      </div>

      <button onClick={doLogin} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">
        Login Karo
      </button>

      <p className="text-center text-gray-400 text-sm">ya</p>

      <button onClick={doLogin} className="w-full bg-white border-2 border-gray-200 rounded-2xl py-3 font-bold text-blue-900 flex items-center justify-center gap-2">
        <span className="text-xl font-extrabold"><span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-amber-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></span>
        Google se Login Karo
      </button>

      <p className="text-center text-xs text-gray-400">Login karke aap hamari shartein swikaar karte hain</p>
    </main>
  );
}
