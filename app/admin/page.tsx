"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const login = () => {
    if (id === "admin" && pw === "admin123") {
      localStorage.setItem("pw_admin", "1");
      router.push("/admin/dashboard");
    } else {
      setErr("Galat ID ya password");
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 bg-blue-950">
      <Image src="/pagdi.png" alt="logo" width={80} height={80} className="object-contain" />
      <h2 className="text-2xl font-extrabold text-white">Admin Login</h2>
      <div className="w-full space-y-3">
        <input
          className="input-gold"
          placeholder="Admin ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          className="input-gold"
          placeholder="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
      </div>
      {err && <p className="text-red-400 text-sm font-semibold">{err}</p>}
      <button onClick={login} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">
        Login Karo
      </button>
      <p className="text-amber-200/60 text-xs">Demo: admin / admin123</p>
    </main>
  );
}
