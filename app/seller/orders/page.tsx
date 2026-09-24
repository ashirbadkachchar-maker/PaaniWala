"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SellerNav from "@/components/SellerNav";
import { supabase } from "@/lib/supabase";

const STATUS = ["Raste Me Hai", "Pahunch Gaya", "Cancel"];

export default function SellerOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller"); return; }
    supabase.from("orders").select("*").eq("seller_id", sid).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });
  }, [router]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <>
      <SellerNav />
      <main className="flex-1 p-4 space-y-3 bg-gray-50">
        <h2 className="text-xl font-extrabold text-blue-900">Mere Orders ({orders.length})</h2>
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-sm space-y-2">
              <div className="flex justify-between">
                <p className="font-bold text-blue-900">{o.order_id} - {o.item_name}</p>
                <p className="font-bold">Rs {o.total}</p>
              </div>
              <p className="text-gray-500">{o.mobile} - {o.delivery_slot}</p>
              <p className="text-gray-500">{o.address}</p>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="input-gold text-sm font-bold">
                {STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
          {orders.length === 0 && <p className="text-gray-400 text-sm">Abhi koi order nahi hai</p>}
        </div>
      </main>
    </>
  );
}
