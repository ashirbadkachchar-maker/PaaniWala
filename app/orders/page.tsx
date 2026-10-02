"use client";
import { useEffect, useState } from "react";
import { supabase, getMobile } from "@/lib/supabase";
import Link from "next/link";

export default function Orders(){
  const [list,setList]=useState<any[]>([]);
  useEffect(()=>{
    const m=getMobile();
    if(m) supabase.from("orders").select("*").eq("mobile",m).order("created_at",{ascending:false}).then(({data})=>setList(data||[]));
  },[]);
  return (
    <main className="p-4 space-y-3">
      <h2 className="text-xl font-bold">Mere Orders - {getMobile()}</h2>
      {list.map(o=>(
        <div key={o.order_id} className="gold-card p-4 rounded-2xl">
          <p>{o.item_name} - Rs {o.price} - {o.status}</p>
          <p className="text-xs">{o.order_id}</p>
          <Link href={"/track/"+o.order_id} className="text-blue-600 text-sm">Track Karo →</Link>
        </div>
      ))}
    </main>
  )
}
