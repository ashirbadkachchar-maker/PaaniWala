"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const tabs = ["Sab", "Naya", "Confirm", "Raste Me Hai", "Pahuncha"];

const badge: Record<string, string> = {
  "Naya": "bg-amber-100 text-amber-700",
  "Confirm": "bg-blue-100 text-blue-700",
  "Raste Me Hai": "bg-purple-100 text-purple-700",
  "Pahuncha": "bg-green-100 text-green-700",
  "Cancel": "bg-red-100 text-red-500",
};

export default function SellerOrders() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("Sab");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller/login"); return; }
    setReady(true);
    supabase
      .from("orders")
      .select("id,order_id,item_name,qty,price,mobile,delivery_slot,status,created_at")
      .eq("seller_id", sid)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });
  }, [router]);

  const filtered = tab === "Sab" ? orders : orders.filter((o) => (o.status || "Naya") === tab);
  const newCount = orders.filter((o) => (o.status || "Naya") === "Naya").length;

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Link href="/seller/dashboard" className="text-blue-600 font-semibold text-sm">← Dashboard</Link>
          {newCount > 0 && <span className="text-xs font-extrabold text-white bg-red-500 rounded-full px-3 py-1">{newCount} naya</span>}
        </div>
        <h2 className="text-xl font-extrabold text-blue-900">Mere Orders</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={"whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm " + (tab === t ? "gold-btn text-white" : "bg-gray-100 text-gray-500")}>{t}</button>
          ))}
        </div>
        <div className="space-y-3">
          {filtered.map((o) => (
            <Link key={o.id} href={"/seller/orders/" + o.id} className="gold-card rounded-2xl p-4 block">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-bold text-blue-900">{o.item_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{o.mobile ? "+91 " + o.mobile + " • " : ""}{o.delivery_slot || ""}</p>
                </div>
                <span className={"text-xs font-extrabold px-3 py-1 rounded-full " + (badge[o.status || "Naya"] || "bg-gray-100")}>{o.status || "Naya"}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-bold">Rs {o.price}</span>
                <span className="text-blue-600 text-sm font-semibold">Detail →</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-400 text-center">Is list me koi order nahi</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
