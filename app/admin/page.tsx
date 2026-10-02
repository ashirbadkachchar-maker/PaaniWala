"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function AdminLogin() {
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const login = () => {
    if (pass === "admin123") {
      localStorage.setItem("pw_admin", "1");
      router.push("/admin/dashboard");
    } else {
      setErr("Galat password - admin123 dalo");
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-6 space-y-4">
        <h2 className="text-xl font-extrabold text-blue-900">Admin Login</h2>
        <p className="text-sm text-gray-500">Sirf tere liye - sellers approve karne ke liye</p>
        <input
          className="input-gold"
          type="password"
          placeholder="Password: admin123"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        {err && <p className="text-red-500 text-sm font-semibold text-center">{err}</p>}
        <button onClick={login} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">
          Admin Login
        </button>
        <p className="text-xs text-gray-400 text-center">Password abhi admin123 hai, baad me Supabase se change kar dena</p>
      </main>
      <BottomNav />
    </>
  );
}
