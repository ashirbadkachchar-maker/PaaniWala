"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function Track(){
  const [order,setOrder]=useState<any>(null);
  const [stars,setStars]=useState(0);
  const [review,setReview]=useState("");
  const [hasRating,setHasRating]=useState(false);

  useEffect(()=>{
    const oid = localStorage.getItem("pw_last_order");
    if(!oid) return;
    supabase.from("orders").select("*, sellers(business_name)").eq("order_id",oid).single()
      .then(({data})=>{
        if(data){
          setOrder(data);
          supabase.from("ratings").select("id").eq("order_id",data.order_id).maybeSingle()
            .then(({data:r})=>{ if(r) setHasRating(true) });
        }
      });
  },[]);

  const submitRating = async()=>{
    if(!stars || !order) return;
    await supabase.from("ratings").insert({
      order_id: order.order_id,
      seller_id: order.seller_id,
      buyer_mobile: order.mobile,
      rating: stars,
      review
    });
    setHasRating(true);
  };

  if(!order) return <><Header /><main className="p-6 text-center"><p>Abhi koi order nahi</p><Link href="/sellers" className="gold-btn px-6 py-2 rounded-xl text-white">Order Karo</Link></main><BottomNav /></>

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">Order: {order.order_id} - {order.status}</h2>
        <div className="gold-card p-4 rounded-2xl">
          <p>{order.item_name} • {order.delivery_slot}</p>
          {order.sellers && <p className="text-sm text-gray-500">Seller: {order.sellers.business_name}</p>}
        </div>

        {(order.status==="Pahuncha" || order.status==="Pahunch Gaya") && !hasRating && (
          <div className="border-2 border-amber-300 bg-amber-50 p-4 rounded-2xl space-y-3">
            <p className="font-bold text-center">Seller ko rating do ⭐</p>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(s=><button key={s} onClick={()=>setStars(s)} className="text-4xl">{s<=stars?"⭐":"☆"}</button>)}
            </div>
            <input className="input-gold" placeholder="Review likho" value={review} onChange={e=>setReview(e.target.value)} />
            <button onClick={submitRating} className="gold-btn w-full py-2.5 rounded-2xl text-white font-bold">Rating Bhejo</button>
          </div>
        )}
        {hasRating && <p className="text-center text-green-600 font-bold">🙏 Dhanyavaad!</p>}
        <Link href="/orders" className="block text-center text-blue-600">← Mere Orders</Link>
      </main>
      <BottomNav />
    </>
  )
}
