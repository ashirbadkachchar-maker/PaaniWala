"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminProducts() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("products").select("id,item_type,item_name,price,seller_id,created_at").order("created_at", { ascending: false }).limit(100);
    if (data) setProducts(data);
  };

  useEffect(() => {
    if (!localStorage.getItem("pw_admin")) { router.push("/admin/login"); return; }
    setReady(true);
    load();
  }, [router]);

  const del = async (id: string) => {
    if (!confirm("Delete karna hai?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href="/admin/dashboard" className="text-blue-600 font-semibold text-sm">← Dashboard</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Saare Products ({products.length})</h2>

        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="gold-card rounded-2xl p-4 flex justify-between items-center gap-2">
              <div>
                <p className="font-bold text-blue-900">{p.item_name}</p>
                <p className="text-xs text-gray-500">{p.item_type} • Rs {p.price} • Seller: {String(p.seller_id).slice(0,6)}</p>
              </div>
              <button onClick={() => del(p.id)} className="text-xs font-bold text-red-500 border border-red-200 rounded-lg px-2 py-1">Delete</button>
            </div>
          ))}
          {products.length===0 && <p className="text-sm text-gray-400 text-center">Koi product nahi</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
