"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";
import { supabase } from "@/lib/supabase";

export default function SellerProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("camper");

  useEffect(() => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller"); return; }
    supabase.from("products").select("*").eq("seller_id", sid).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setProducts(data); });
  }, [router]);

  const add = async () => {
    if (!name || !price) return;
    const sid = localStorage.getItem("pw_seller_id");
    const { data } = await supabase.from("products")
      .insert({ seller_id: sid, item_type: type, item_name: name, price: parseInt(price), active: true })
      .select().single();
    if (data) { setProducts([data, ...products]); setName(""); setPrice(""); }
  };

  const toggle = async (p: any) => {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    setProducts(products.map((x) => (x.id === p.id ? { ...x, active: !p.active } : x)));
  };

  const del = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((x) => x.id !== id));
  };

  return (
    <>
      <SellerNav />
      <main className="flex-1 p-4 space-y-3 bg-gray-50">
        <h2 className="text-xl font-extrabold text-blue-900">Mere Products</h2>
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-3 space-y-2">
          <p className="font-bold text-blue-900 text-sm">Naya Product Jodo</p>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-gold text-sm">
            <option value="camper">Camper (20L)</option>
            <option value="tanker">Tanker</option>
          </select>
          <input className="input-gold text-sm" placeholder="Naam (jaise Shuddh Paani - 20L Camper)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input-gold text-sm" placeholder="Price (Rs)" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
          <button onClick={add} className="gold-btn w-full text-white font-bold py-2 rounded-2xl text-sm">Product Jodo</button>
        </div>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-blue-900">{p.item_name}</p>
                <p className="text-amber-600 font-extrabold">Rs {p.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(p)} className={"text-xs font-bold px-3 py-1.5 rounded-full " + (p.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500")}>
                  {p.active ? "Chalu" : "Band"}
                </button>
                <button onClick={() => del(p.id)} className="text-red-500 font-bold">X</button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-gray-400 text-sm">Koi product nahi - upar se jodo</p>}
        </div>
      </main>
    </>
  );
}
