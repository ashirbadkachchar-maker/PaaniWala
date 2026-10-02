"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

const steps = ["Naya", "Confirm", "Raste Me Hai", "Pahuncha"];

export default function TrackById({ params }: { params: { oid: string } }){
  const [order,setOrder]=useState<any>(null);
  const [sellerName,setSellerName]=useState("");
  const [stars,setStars]=useState(0);
  const [review,setReview]=useState("");
  const [hasRating,setHasRating]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const load = async() => {
      const oid = params.oid;
      const { data } = await supabase.from("orders").select("*").or(`order_id.eq.${oid},id.eq.${oid}`).maybeSingle();
      if(!data){ setLoading(false); return; }
      setOrder(data);
      if(data.seller_id){
        const { data: s } = await supabase.from("sellers").select("business_name").eq("id", data.seller_id).maybeSingle();
        if(s) setSellerName(s.business_name);
      }
      const { data: r } = await supabase.from("ratings").select("id").eq("order_id", data.order_id).maybeSingle();
      if(r) setHasRating(true);
      setLoading(false);
    };
    load();
  },[params.oid]);

  const submitRating = async()=>{
    if(!stars || !order) return;
    await supabase.from("ratings").insert({ order_id: order.order_id, seller_id: order.seller_id, buyer_mobile: order.mobile, rating: stars, review });
    setHasRating(true);
  };

  if(loading) return <><Header /><main className="p-6 text-center text-gray-400">Loading...</main><BottomNav /></>;
  if(!order) return <><Header /><main className="p-6 text-center"><p>Order nahi mila</p><Link href="/orders" className="text-blue-600">← Orders</Link></main><BottomNav /></>;

  const st = order.status || "Naya";
  const isDelivered = st==="Pahuncha" || st==="Pahunch Gaya";
  const stepIdx = steps.indexOf(st==="Pahunch Gaya" ? "Pahuncha" : st);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href="/orders" className="text-blue-600 text-sm">← Orders</Link>
        <h2 className="text-xl font-bold text-blue-900">{order.order_id} - {st}</h2>
        <div className="gold-card p-4 rounded-2xl">
          <p className="font-bold">{order.item_name} • {order.delivery_slot}</p>
          {sellerName && <p className="text-sm text-gray-500">Seller: {sellerName}</p>}
        </div>
        <div className="gold-card rounded-2xl p-4">
          <div className="flex items-center">
            {steps.map((s,i)=>(
              <div key={s} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold "+(i<=stepIdx ? "gold-btn" : "bg-gray-200 text-gray-400")}>{i+1}</div>
                  <span className={"text-[10px] mt-1 text-center "+(i<=stepIdx ? "text-blue-900 font-bold" : "text-gray-400")}>{s}</span>
                </div>
                {i<steps.length-1 && <div className={"flex-1 h-1 mx-1 "+(i<stepIdx ? "bg-amber-400" : "bg-gray-200")} />}
              </div>
            ))}
          </div>
        </div>
        {isDelivered && !hasRating && (
          <div className="border-2 border-amber-300 bg-amber-50 p-4 rounded-2xl space-y-3">
            <p className="font-bold text-center">Rating do ⭐</p>
            <div className="flex justify-center gap-2">{[1,2,3,4,5].map(s=><button key={s} onClick={()=>setStars(s)} className="text-4xl">{s<=stars?"⭐":"☆"}</button>)}</div>
            <input className="input-gold w-full" placeholder="Review" value={review} onChange={e=>setReview(e.target.value)} />
            <button onClick={submitRating} className="gold-btn w-full py-3 rounded-2xl text-white font-bold">Bhejo</button>
          </div>
        )}
        {hasRating && <p className="text-center text-green-600 font-bold">🙏 Dhanyavaad!</p>}
      </main>
      <BottomNav />
    </>
  )
}
