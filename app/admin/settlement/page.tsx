"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { supabase } from "@/lib/supabase";

function monday(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0,0,0,0);
  return x;
}

export default function Settlement() {
  const router = useRouter();
  const [weeks, setWeeks] = useState<Date[]>([]);
  const [wi, setWi] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pw_admin")!== "1") { router.push("/admin"); return; }
    const ws: Date[] = []; let m = monday(new Date());
    for (let i=0;i<8;i++){ ws.push(new Date(m)); const n=new Date(m); n.setDate(n.getDate()-7); m=n; }
    setWeeks(ws);
  }, [router]);

  useEffect(() => {
    if (!weeks.length) return;
    (async () => {
      setLoading(true);
      const start=weeks[wi]; const end=new Date(start); end.setDate(end.getDate()+7);
      const { data: sellers } = await supabase.from("sellers").select("id,business_name").eq("status","approved");
      const { data: orders } = await supabase.from("orders").select("seller_id,total,commission").gte("created_at",start.toISOString()).lt("created_at",end.toISOString());
      const { data: settled } = await supabase.from("settlements").select("*").eq("week_start",start.toISOString().slice(0,10));
      const map:any={}; (orders||[]).forEach((o:any)=>{ if(!o.seller_id) return; map[o.seller_id]=map[o.seller_id]||{sales:0,comm:0,n:0}; map[o.seller_id].sales+=o.total||0; map[o.seller_id].comm+=o.commission||0; map[o.seller_id].n+=1; });
      const smap:any={}; (settled||[]).forEach((s:any)=>{ smap[s.seller_id]=s; });
      setRows((sellers||[]).map((s:any)=>({...s, sales:map[s.id]?.sales||0, comm:map[s.id]?.comm||0, n:map[s.id]?.n||0, collected:!!smap[s.id]?.collected })));
      setLoading(false);
    })();
  }, [weeks,wi]);

  const markCollected = async (seller_id:string,sales:number,comm:number,n:number)=>{
    const week_start=weeks[wi].toISOString().slice(0,10);
    await supabase.from("settlements").upsert({ seller_id, week_start, total_sales:sales, commission_due:comm, orders_count:n, collected:true, collected_at:new Date().toISOString() }, { onConflict:"seller_id,week_start" });
    setRows(rows.map((r:any)=>r.id===seller_id?{...r,collected:true}:r));
  };

  const fmt=(d:Date)=>d.toLocaleDateString("hi-IN",{day:"numeric",month:"short"});
  const totalDue=rows.filter((r:any)=>!r.collected).reduce((s:any,r:any)=>s+r.comm,0);

  return (
    <>
      <AdminNav />
      <main className="flex-1 p-4 space-y-4 bg-gray-50">
        <h2 className="text-xl font-extrabold text-blue-900">Weekly Settlement</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weeks.map((wk,i)=><button key={i} onClick={()=>setWi(i)} className={"chip whitespace-nowrap "+(wi===i?"chip-on":"chip-off")}>{fmt(wk)} - {fmt(new Date(wk.getTime()+6*24*3600000))}</button>)}
        </div>
        <div className="bg-purple-100 rounded-2xl p-4"><p className="text-sm font-semibold text-purple-800">Is hafte vasool karna hai</p><p className="text-3xl font-extrabold text-purple-900">Rs {totalDue}</p></div>
        {loading && <p className="text-gray-400 text-sm">Load ho raha hai...</p>}
        <div className="space-y-2">
          {rows.map((r:any)=>(
            <div key={r.id} className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-sm space-y-1">
              <div className="flex justify-between items-center"><p className="font-bold text-blue-900">{r.business_name}</p>{r.collected? <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">Vasool Ho Gaya</span> : <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-600">Baki Hai</span>}</div>
              <p className="text-gray-500">{r.n} orders - Kul sales Rs {r.sales}</p>
              <div className="flex justify-between items-center"><p className="font-extrabold text-purple-800">Commission: Rs {r.comm}</p>{!r.collected && r.comm>0 && <button onClick={()=>markCollected(r.id,r.sales,r.comm,r.n)} className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full">Vasool Ho Gaya</button>}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
