"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Shop({ params }: { params: { id: string } }) {
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("sellers").select("*").eq("id", params.id).single()
      .then(({ data }) => { if (data) setSeller(data); });
    supabase.from("products").select("*").eq("seller_id", params.id).eq("active", true)
      .then(({ data }) => { if (data) setProducts(data); });
  }, [params.id]);
  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-3">
        <Link href="/sellers" className="text-blue-600 font-semibold text-sm">← Sellers</Link>
        {seller && (
          <div className="gold-card rounded-2xl p-4">
            <p className="font-extrabold text-blue-900 text-xl">{seller.business_name}</p>
            <p className="text-sm text-gray-500">{seller.area || ""} {seller.address ? "- " + seller.address : ""}</p>
          </div>
        )}
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-5xl">{p.item_type === "camper" ? "🫙" : "🚛"}</span>
              <div className="flex-1">
                <p className="font-bold text-blue-900">{p.item_name}</p>
                <p className="text-lg font-extrabold text-amber-600">Rs {p.price}</p>
              </div>
              <Link href={"/order/" + p.id} className="gold-btn text-white text-sm font-bold px-4 py-2.5 rounded-full">
                Order Karo
              </Link>
            </div>
          ))}
          {products.length === 0 && <p className="text-gray-400 text-sm text-center">Is seller ke paas abhi koi product nahi</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
