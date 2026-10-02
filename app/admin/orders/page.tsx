"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminOrders() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!localStorage.getItem("pw_admin")) { router.push("/admin/login"); return; }
    setReady(true);
    supabase
    .from("orders")
    .select("id,order_id,mobile,item_name,qty,price,commission,seller_earning,delivery_slot,status,created_at,seller_id")
    .order("created_at", { ascending: false })
    .limit(100)
    .then(({ data }) => { if (data) setOrders(data); });
  }, [router]);

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  const filtered = filter === "all"? orders : orders.filter((o) => o.status === filter);
  const totalCommission = orders.reduce((s, o) => s + (Number(o.commission) || 0), 0);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href="/admin/dashboard" className="text-blue-600 font-semibold text-sm">← Dashboard</Link>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-blue-900">Saare Orders ({orders.length})</h2>
          <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">Comm: Rs {totalCommission}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all","Raste Me Hai","Pahuncha"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={"whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm " + (filter===f? "gold-btn text-white" : "bg-gray-100 text-gray-500")}>
              {f==="all"? "Sab" : f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="gold-card rounded-2xl p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-bold text-blue-900">{o.item_name} {o.qty? "x" + o.qty : ""}</p>
                  <p className="text-xs text-gray-500">+91 {o.mobile} • {o.delivery_slot}</p>
                  <p className="text-xs text-gray-400">{o.order_id} • {o.created_at? new Date(o.created_at).toLocaleDateString() : ""}</p>
                </div>
                <span className={"text-xs font-bold px-3 py-1 rounded-full " + (o.status==="Pahuncha"? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                  {o.status}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="font-bold">Rs {o.price} <span className="text-red-500">-Rs {o.commission} comm</span></span>
                <span className="font-extrabold text-green-600">Seller ko: Rs {o.seller_earning}</span>
              </div>
            </div>
          ))}
          {filtered.length===0 && <p className="text-sm text-gray-400 text-center">Koi order nahi</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
