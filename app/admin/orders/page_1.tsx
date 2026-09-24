"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { supabase } from "@/lib/supabase";

const STATUS = ["Raste Me Hai", "Pahunch Gaya", "Cancel"];

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("Sab");

  useEffect(() => {
    if (localStorage.getItem("pw_admin") !== "1") {
      router.push("/admin");
      return;
    }
    supabase.from("orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });
  }, [router]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const shown = filter === "Sab" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <AdminNav />
      <main className="flex-1 p-4 space-y-3 bg-gray-50">
        <h2 className="text-xl font-extrabold text-blue-900">Orders ({shown.length})</h2>
        <div className="flex gap-2 flex-wrap">
          {["Sab", ...STATUS].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`chip ${filter === s ? "chip-on" : "chip-off"}`}>{s}</button>
          ))}
        </div>
        <div className="space-y-2">
          {shown.map((o) => (
            <div key={o.id} className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-sm space-y-2">
              <div className="flex justify-between">
                <p className="font-bold text-blue-900">{o.order_id} — {o.item_name}</p>
                <p className="font-bold">Rs {o.total}</p>
              </div>
              <p className="text-gray-500">{o.mobile} · {o.delivery_slot}</p>
              <p className="text-gray-500">{o.address}</p>
              <select
                value={o.status}
                onChange={(e) => updateStatus(o.id, e.target.value)}
                className="input-gold text-sm font-bold"
              >
                {STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
          {shown.length === 0 && <p className="text-gray-400 text-sm">Koi order nahi mila</p>}
        </div>
      </main>
    </>
  );
}
