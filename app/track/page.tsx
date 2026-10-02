"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const steps = ["Naya", "Confirm", "Raste Me Hai", "Pahuncha"];

function TrackInner(){
  const searchParams = useSearchParams();
  const [order,setOrder]=useState<any>(null);
  const [sellerName,setSellerName]=useState("");
  const [stars,setStars]=useState(0);
  const [review,setReview]=useState("");
  const [hasRating,setHasRating]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const load = async() => {
      // Support ?oid=PW-xxx or localStorage fallback
      const oidParam = searchParams.get("oid") || searchParams.get("id");
      const oid = oidParam || localStorage.getItem("pw_last_order");
      if(!oid) { setLoading(false); return; }
      
      const { data } = await supabase.from("orders").select("*").eq("order_id", oid).maybeSingle();
      if(!data) { setLoading(false); return; }
      setOrder(data);
      
      // Seller name separately (no FK join needed)
      if(data.seller_id){
        const { data: s } = await supabase.from("sellers").select("business_name").eq("id", data.seller_id).maybeSingle();
        if(s) setSellerName(s.business_name);
      }
      // Check if already rated
      const { data: r } = await supabase.from("ratings").select("id").eq("order_id", data.order_id).maybeSingle();
      if(r) setHasRating(true);
      setLoading(false);
    };
    load();
  },[searchParams]);

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

  if(loading) return <><Header /><main className="flex-1 p-6 text-center text-gray-400">Loading...</main><BottomNav /></>;
  if(!order) return <><Header /><main className="flex-1 p-6 flex flex-col items-center gap-3 text-center"><p className="text-5xl">📦</p><p className="font-bold text-blue-900">Abhi koi order nahi</p><Link href="/sellers" className="gold-btn px-6 py-2.5 rounded-xl text-white font-bold">Order Karo</Link></main><BottomNav /></>;

  const st = order.status || "Naya";
  const isDelivered = st==="Pahuncha" || st==="Pahunch Gaya";
  const stepIdx = steps.indexOf(st==="Pahunch Gaya" ? "Pahuncha" : st);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Link href="/orders" className="text-blue-600 font-semibold text-sm">← Mere Orders</Link>
          <span className="text-xs font-bold bg-blue-50 text-blue-900 px-3 py-1 rounded-full">{order.order_id}</span>
        </div>
        <h2 className="text-xl font-extrabold text-blue-900">Order: {order.order_id}</h2>
        <div className="gold-card p-4 rounded-2xl space-y-1">
          <div className="flex justify-between"><span className="text-sm text-gray-500">Item</span><span className="font-bold text-blue-900 text-sm">{order.item_name}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Slot</span><span className="font-bold text-sm">{order.delivery_slot}</span></div>
          {sellerName && <div className="flex justify-between"><span className="text-sm text-gray-500">Seller</span><span className="font-bold text-sm">{sellerName}</span></div>}
          <div className="flex justify-between"><span className="text-sm text-gray-500">Status</span><span className="font-extrabold text-amber-600 text-sm">{st}</span></div>
        </div>

        {/* Status timeline */}
        <div className="gold-card rounded-2xl p-4">
          <div className="flex items-center">
            {steps.map((s,i)=>(
              <div key={s} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold "+(i<=stepIdx ? "gold-btn" : "bg-gray-200 text-gray-400")}>{i+1}</div>
                  <span className={"text-[10px] mt-1 font-semibold text-center "+(i<=stepIdx ? "text-blue-900" : "text-gray-400")}>{s}</span>
                </div>
                {i<steps.length-1 && <div className={"flex-1 h-1 mx-1 rounded "+(i<stepIdx ? "bg-amber-400" : "bg-gray-200")} />}
              </div>
            ))}
          </div>
        </div>

        {isDelivered && !hasRating && (
          <div className="border-2 border-amber-300 bg-amber-50 p-4 rounded-2xl space-y-3">
            <p className="font-bold text-center text-blue-900">Seller ko rating do ⭐</p>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(s=><button key={s} onClick={()=>setStars(s)} className="text-4xl leading-none">{s<=stars?"⭐":"☆"}</button>)}
            </div>
            <input className="input-gold w-full mt-1" placeholder="Review likho (optional)" value={review} onChange={e=>setReview(e.target.value)} />
            <button onClick={submitRating} disabled={!stars} className="gold-btn w-full py-3 rounded-2xl text-white font-bold disabled:opacity-50">Rating Bhejo</button>
          </div>
        )}
        {hasRating && <p className="text-center text-green-600 font-bold bg-green-50 rounded-2xl py-3">🙏 Dhanyavaad! Rating bhej di gayi</p>}
      </main>
      <BottomNav />
    </>
  )
}

export default function Track(){
  return (
    <Suspense fallback={<main className="p-6 text-center text-gray-400">Loading...</main>}>
      <TrackInner />
    </Suspense>
  )
}
