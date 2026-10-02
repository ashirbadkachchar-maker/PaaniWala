"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getMobile } from "@/lib/supabase";

const badge: Record<string, string> = {
  "Naya": "bg-amber-100 text-amber-700",
  "Confirm": "bg-blue-100 text-blue-700",
  "Raste Me Hai": "bg-purple-100 text-purple-700",
  "Pahuncha": "bg-green-100 text-green-700",
  "Cancel": "bg-red-100 text-red-500",
};

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [noLogin, setNoLogin] = useState(false);

  useEffect(() => {
    const m = getMobile();
    if (!m) { setNoLogin(true); setLoaded(true); return; }
    supabase
      .from("orders")
      .select("order_id,item_name,qty,price,seller_id,status,created_at")
      .eq("mobile", m)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;
  }

  if (noLogin) {
    return (
      <>
        <Header />
        <main className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-5xl">📦</p>
          <h2 className="text-xl font-extrabold text-blue-900">Mere Orders</h2>
          <p className="text-sm text-gray-500">Orders dekhne ke liye pehle login karo</p>
          <Link href="/login?next=/orders" className="gold-btn text-white font-bold px-8 py-3 rounded-2xl">
            Login Karo
          </Link>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href="/home" className="text-blue-600 font-semibold text-sm">← Home</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Mere Orders</h2>
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.order_id} className="gold-card rounded-2xl p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-bold text-blue-900">{o.item_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""} • Rs {o.price}
                  </p>
                </div>
                <span className={"text-xs font-extrabold px-3 py-1 rounded-full whitespace-nowrap " + (badge[o.status || "Naya"] || "bg-gray-100 text-gray-500")}>
                  {o.status || "Naya"}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <Link href={"/track/" + o.order_id} className="flex-1 gold-btn text-white text-sm font-bold py-2.5 rounded-xl text-center">
                  Track Karo
                </Link>
                <Link href={"/shop/" + o.seller_id} className="flex-1 bg-blue-900 text-white text-sm font-bold py-2.5 rounded-xl text-center">
                  Phir Se Order Karo
                </Link>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-5xl mb-2">💧</p>
              <p className="text-sm text-gray-400">Abhi koi order nahi hai</p>
              <Link href="/home" className="text-blue-600 font-bold text-sm">Paani order karo →</Link>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
