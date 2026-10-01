"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const typeName: Record<string, string> = {
  bottle20: "20L Pani Bottle",
  camper: "Camper",
  tanker: "Tanker",
  bisleri: "Bisleri Bottles",
};

const unitOf = (t: string) => (t === "camper"? "/can" : t === "tanker"? "/tanker" : "/bottle");

function ShopInner({ sid }: { sid: string }) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "";
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase
       .from("sellers")
       .select("id,business_name,area,address,rating,status")
       .eq("id", sid)
       .single();
      if (s) setSeller(s);
      let q = supabase.from("products").select("id,item_type,item_name,price").eq("seller_id", sid);
      if (type) q = q.eq("item_type", type);
      const { data: p } = await q;
      if (p) setProducts(p);
      setLoading(false);
    })();
  }, [sid, type]);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href={"/sellers" + (type? "?type=" + type : "")} className="text-blue-600 font-semibold text-sm">
          ← Sellers
        </Link>
        {seller && seller.status === "approved" && (
          <div>
            <h2 className="text-xl font-extrabold text-blue-900">{seller.business_name}</h2>
            <p className="text-sm text-gray-500">
              {seller.area || ""}{seller.address? " - " + seller.address : ""}
            </p>
          </div>
        )}
        {type && typeName[type] && (
          <p className="text-sm font-bold text-amber-600">{typeName[type]}</p>
        )}
        {seller && seller.status!== "approved"? (
          <div className="gold-card rounded-2xl p-6 text-center space-y-1">
            <p className="font-extrabold text-blue-900">Ye dukkan abhi uplabdh nahi hai</p>
            <p className="text-sm text-gray-500">Admin approval ke baad buyers ko dikhegi</p>
            <Link href="/sellers" className="inline-block mt-2 text-blue-600 font-semibold text-sm">
              Dusre sellers dekho
            </Link>
          </div>
        ) : loading? (
          <p className="text-gray-400 text-sm">Load ho raha hai...</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={"/order/" + p.id}
                className="gold-card rounded-2xl p-4 flex justify-between items-center gap-2"
              >
                <div>
                  <p className="font-bold text-blue-900">{p.item_name}</p>
                  <p className="text-sm text-gray-500">{typeName[p.item_type] || p.item_type}</p>
                </div>
                <span className="text-lg font-extrabold text-amber-600 whitespace-nowrap">
                  Rs {p.price}{unitOf(p.item_type)}
                </span>
              </Link>
            ))}
            {products.length === 0 && (
              <p className="text-gray-400 text-sm text-center">Is seller ke paas iska product abhi nahi hai</p>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

export default function Shop({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<p className="p-6 text-center text-gray-400">Loading...</p>}>
      <ShopInner sid={params.id} />
    </Suspense>
  );
}
