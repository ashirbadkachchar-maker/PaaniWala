"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Track() {
  const [order, setOrder] = useState<any>(null);
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");
  const [hasRating, setHasRating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const oid = localStorage.getItem("pw_last_order");
    if (!oid) return;
    (async () => {
      const { data } = await supabase.from("orders").select("*, sellers(business_name)").eq("order_id", oid).single();
      if (data) {
        setOrder(data);
        const { data: r } = await supabase.from("ratings").select("id").eq("order_id", data.order_id).maybeSingle();
        if (r) setHasRating(true);
      }
    })();
  }, []);

  const submitRating = async () => {
    if (!stars ||!order) return;
    setSaving(true);
    await supabase.from("ratings").insert({
      order_id: order.order_id,
      seller_id: order.seller_id,
      buyer_mobile: order.mobile,
      rating: stars,
      review: review,
    });
    setSaving(false);
    setHasRating(true);
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">Order Track Karo</h2>
        {!order && (
          <div className="text-center space-y-3 py-8">
            <p className="text-gray-400">Abhi koi order nahi hai</p>
            <Link href="/sellers" className="gold-btn inline-block text-white font-bold px-6 py-3 rounded-2xl">Pehla Order Karo</Link>
          </div>
        )}
        {order && (
          <>
            <div className="gold-card rounded-2xl p-4 text-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-900">Order ID: {order.order_id}</span>
                <span className={"text-xs font-bold px-3 py-1 rounded-full " + (order.status === "Pahunch Gaya"? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800")}>{order.status}</span>
              </div>
              <p>{order.item_name}</p>
              <p className="text-gray-500">{order.delivery_slot}</p>
              {order.sellers && <p className="text-gray-500">Seller: {order.sellers.business_name}</p>}
            </div>

            {order.status === "Pahunch Gaya" &&!hasRating && (
              <div className="border-2 border-amber-300 rounded-2xl p-4 space-y-3 bg-amber-50">
                <p className="font-bold text-blue-900 text-center">Seller ko rating do ⭐</p>
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map((s)=><button key={s} onClick={()=>setStars(s)} className="text-4xl">{s <= stars? "⭐" : "☆"}</button>)}
                </div>
                <input className="input-gold text-sm" placeholder="Kuch kehna ho to likho (optional)" value={review} onChange={(e)=>setReview(e.target.value)} />
                <button onClick={submitRating} disabled={!stars || saving} className="gold-btn w-full text-white font-bold py-2.5 rounded-2xl disabled:opacity-50">{saving? "Ruko..." : "Rating Bhejo"}</button>
              </div>
            )}
            {order.status === "Pahunch Gaya" && hasRating && <p className="text-center text-green-600 font-bold">🙏 Rating ke liye dhanyavaad!</p>}
          </>
        )}
        <Link href="/home" className="block text-center text-blue-600 font-semibold text-sm">← Home Jao</Link>
      </main>
      <BottomNav />
    </>
  );
}
