"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const steps = ["Raste Me Hai", "Pahuncha"];

export default function OrderDetail({ params }: { params: { oid: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller/login"); return; }
    // id ya order_id dono se dhoondho - tera schema me order_id hai
    const { data } = await supabase
   .from("orders")
   .select("*")
   .or(`id.eq.${params.oid},order_id.eq.${params.oid}`)
   .eq("seller_id", sid)
   .maybeSingle();
    if (!data) { setNotFound(true); return; }
    setOrder(data);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (st: string) => {
    if (!order) return;
    setSaving(true);
    await supabase.from("orders").update({ status: st }).eq("id", order.id);
    setSaving(false);
    load();
  };

  if (notFound) {
    return (
      <>
        <Header />
        <main className="flex-1 p-6 text-center space-y-3">
          <p className="font-bold text-blue-900">Order nahi mila</p>
          <Link href="/seller/orders" className="text-blue-600 font-semibold text-sm">← Orders</Link>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!order) {
    return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;
  }

  const st = order.status || "Raste Me Hai";
  const stepIdx = st === "Pahuncha"? 1 : 0;

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href="/seller/orders" className="text-blue-600 font-semibold text-sm">← Orders</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Order Detail</h2>

        <div className="gold-card rounded-2xl p-4 space-y-2">
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Order ID</span><span className="font-bold text-blue-900 text-sm">{order.order_id || String(order.id).slice(0, 8)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Item</span><span className="font-bold text-blue-900 text-sm">{order.item_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Qty</span><span className="font-bold text-blue-900 text-sm">{order.qty}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Kul Price</span><span className="font-extrabold text-amber-600">Rs {order.price}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Platform Fee (5%)</span><span className="font-bold text-red-500 text-sm">- Rs {order.commission || 0}</span></div>
          <div className="flex justify-between border-t pt-2"><span className="text-gray-500 text-sm">Aapki Kamai</span><span className="font-extrabold text-green-600">Rs {order.seller_earning || order.price}</span></div>
        </div>

        <div className="gold-card rounded-2xl p-4 space-y-2">
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Buyer Mobile</span><span className="font-bold text-blue-900 text-sm">+91 {order.mobile}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Delivery Slot</span><span className="font-bold text-blue-900 text-sm">{order.delivery_slot}</span></div>
          <div><span className="text-gray-500 text-sm">Address</span><p className="font-bold text-blue-900 text-sm">{order.address}</p></div>
        </div>

        {st!== "Cancel" && (
          <div className="gold-card rounded-2xl p-4">
            <p className="font-bold text-blue-900 text-sm mb-3">Order Status</p>
            <div className="flex items-center">
              {steps.map((s, i) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold " + (i <= stepIdx? "gold-btn" : "bg-gray-200 text-gray-400")}>
                      {i + 1}
                    </div>
                    <span className={"text-[10px] mt-1 text-center font-semibold " + (i <= stepIdx? "text-blue-900" : "text-gray-400")}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={"flex-1 h-1 mx-1 rounded " + (i < stepIdx? "bg-amber-400" : "bg-gray-200")} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {st === "Cancel" && (
          <p className="text-center font-bold text-red-500 bg-red-50 rounded-2xl py-3">Ye order cancel ho gaya hai</p>
        )}

        <div className="space-y-2">
          {st === "Raste Me Hai" && (
            <button onClick={() => setStatus("Pahuncha")} disabled={saving} className="w-full bg-green-600 text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-60">
              ✓ Pahuncha - Complete Karo
            </button>
          )}
          {st === "Naya" && (
            <button onClick={() => setStatus("Raste Me Hai")} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-60">
              Raste Me Bhejo
            </button>
          )}
          {st === "Pahuncha" && (
            <p className="text-center font-bold text-green-600 bg-green-50 rounded-2xl py-3">✓ Order poora ho gaya</p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
