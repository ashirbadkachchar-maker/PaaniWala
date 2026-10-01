"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const typeName: Record<string, string> = {
  bottle20: "20L Bottle",
  camper: "Camper",
  tanker: "Tanker",
  bisleri: "Bisleri",
};

export default function SellerProducts() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const load = async (sid: string) => {
    const { data } = await supabase
   .from("products")
   .select("id,item_type,item_name,price")
   .eq("seller_id", sid)
   .order("item_name");
    if (data) setProducts(data);
  };

  useEffect(() => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller/login"); return; }
    setReady(true);
    load(sid);
  }, [router]);

  const del = async (id: string) => {
    if (!confirm("Ye product hatana hai?")) return;
    await supabase.from("products").delete().eq("id", id);
    const sid = localStorage.getItem("pw_seller_id");
    if (sid) load(sid);
  };

  if (!ready) {
    return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Link href="/seller/dashboard" className="text-blue-600 font-semibold text-sm">← Dashboard</Link>
          <Link href="/seller/products/add" className="gold-btn text-white text-sm font-bold px-4 py-2 rounded-xl">
            + Naya Product
          </Link>
        </div>
        <h2 className="text-xl font-extrabold text-blue-900">Mere Products</h2>
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="gold-card rounded-2xl p-4 flex justify-between items-center gap-2">
              <div>
                <p className="font-bold text-blue-900">{p.item_name}</p>
                <p className="text-xs text-gray-500">{typeName[p.item_type] || p.item_type} • Rs {p.price}</p>
              </div>
              <button
                onClick={() => del(p.id)}
                className="text-red-500 font-bold text-sm border border-red-200 rounded-xl px-3 py-1.5 shrink-0"
              >
                Hatao
              </button>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-sm text-gray-400 text-center">Koi product nahi hai - upar se naya add karo</p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
