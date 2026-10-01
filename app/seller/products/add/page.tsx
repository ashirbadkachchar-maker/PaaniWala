"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const types = [
  { v: "bottle20", n: "20L Water Bottle" },
  { v: "camper", n: "Camper" },
  { v: "tanker", n: "Tanker" },
  { v: "bisleri", n: "Bis" + "leri Bottles" },
];

export default function AddProduct() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [type, setType] = useState("bottle20");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller/login"); return; }
    setReady(true);
  }, [router]);

  const save = async () => {
    setErr("");
    if (!name.trim()) { setErr("Product ka naam dalo"); return; }
    const pr = parseInt(price);
    if (!pr || pr <= 0) { setErr("Sahi rate dalo (Rs me)"); return; }
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller/login"); return; }
    setSaving(true);
    const { error } = await supabase.from("products").insert({
      seller_id: sid,
      item_type: type,
      item_name: name.trim(),
      price: pr,
    });
    setSaving(false);
    if (error) { setErr("Error: " + error.message); return; }
    router.push("/seller/products");
  };

  if (!ready) {
    return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href="/seller/products" className="text-blue-600 font-semibold text-sm">← Products</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Naya Product Add Karo</h2>

        <div>
          <label className="font-semibold text-blue-900 text-sm">Product Type *</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {types.map((t) => (
              <button
                key={t.v}
                onClick={() => setType(t.v)}
                className={"rounded-2xl py-3 px-2 font-bold text-sm border-2 " + (type === t.v? "border-amber-400 bg-amber-50 text-blue-900" : "border-gray-200 text-gray-500")}
              >
                {t.n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-semibold text-blue-900 text-sm">Product ka Naam *</label>
          <input className="input-gold mt-1" placeholder="jaise: 20L Kinley Jar" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="font-semibold text-blue-900 text-sm">Aapka Rate (Rs) *</label>
          <input className="input-gold mt-1" placeholder="jaise: 35" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" />
          <p className="text-xs text-gray-400 mt-1">Ye rate buyers ko aapki dukkan me dikhega. Platform commission (filhal 5%) is par katega.</p>
        </div>

        {err && <p className="text-red-500 text-sm font-semibold text-center">{err}</p>}

        <button onClick={save} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-60">
          {saving? "Ruko..." : "Product Save Karo"}
        </button>
      </main>
      <BottomNav />
    </>
  );
}
