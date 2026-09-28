"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getMobile, makeOrderId, getBuyerProfile } from "@/lib/supabase";

const times = ["Aaj Subah 8 Baje", "Aaj Shaam 5 Baje", "Kal Subah 8 Baje"];

export default function Checkout({ params }: { params: { pid: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [time, setTime] = useState(times[1]);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    getBuyerProfile().then((p) => setAddress(p?.address || null));
  }, []);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("products").select("*").eq("id", params.pid).single();
      if (p) {
        setProduct(p);
        const { data: s } = await supabase.from("sellers").select("*").eq("id", p.seller_id).single();
        if (s) setSeller(s);
      }
    })();
  }, [params.pid]);

  if (!product) {
    return (<><Header /><main className="flex-1 p-4"><p className="text-gray-400">Load ho raha hai...</p></main><BottomNav /></>);
  }

  const q = product.item_type === "camper" ? qty : 1;
  const price = product.price * q;
  const rate = seller ? seller.commission_rate || 5 : 5;
  const commission = Math.round((price * rate) / 100);

  const placeOrder = async () => {
    if (!address) {
      setOrderError("Pehle apna delivery pata jodo.");
      return;
    }
    setOrderError("");
    setSaving(true);
    const orderId = makeOrderId();
    const { error } = await supabase.from("orders").insert({
      order_id: orderId,
      mobile: getMobile(),
      seller_id: product.seller_id,
      item_type: product.item_type,
      item_name: (product.item_type === "camper" ? q + " x " : "") + product.item_name,
      qty: q,
      price: price,
      discount: 0,
      total: price,
      commission: commission,
      seller_earning: price - commission,
      delivery_slot: time,
      address: address,
      status: "Raste Me Hai",
    });
    setSaving(false);
    if (error) {
      setOrderError("Order nahi hua, dobara koshish karo.");
      return;
    }
    localStorage.setItem("pw_last_order", orderId);
    router.push("/success");
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href={"/shop/" + product.seller_id} className="text-blue-600 font-semibold text-sm">← Wapas</Link>
        <h2 className="text-xl font-bold text-blue-900">Order Confirm Karo</h2>
        <div className="gold-card rounded-2xl p-4">
          <p className="font-bold text-blue-900">{product.item_name}</p>
          <p className="text-sm text-gray-500">{seller ? seller.business_name : ""}</p>
          <p className="text-lg font-extrabold text-amber-600 mt-1">Rs {product.price}{product.item_type === "camper" ? " /can" : ""}</p>
        </div>
        {product.item_type === "camper" && (
          <div className="flex items-center justify-center gap-6 py-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-14 h-14 rounded-full gold-btn text-white text-3xl font-bold">−</button>
            <span className="text-2xl font-extrabold text-blue-900">{qty} Camper</span>
            <button onClick={() => setQty(qty + 1)} className="w-14 h-14 rounded-full gold-btn text-white text-3xl font-bold">+</button>
          </div>
        )}
        <div>
          <p className="font-semibold text-blue-900 mb-2">Delivery Time</p>
          <div className="flex flex-wrap gap-2">
            {times.map((t) => (
              <button key={t} onClick={() => setTime(t)} className={"chip " + (time === t ? "chip-on" : "chip-off")}>{t}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className={address ? "" : "text-red-600"}>{address || "Delivery pata nahi jodha"}</span>
          <Link href="/address" className="text-blue-600 font-semibold shrink-0">{address ? "Badlo" : "Pata Jodo"}</Link>
        </div>
        {orderError && <p role="alert" className="text-sm text-red-600">{orderError}</p>}
        <div className="border-2 border-gray-200 rounded-2xl p-4 text-sm space-y-1">
          <div className="flex justify-between"><span>{product.item_name}{product.item_type === "camper" ? " x " + q : ""}</span><span>Rs {price}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="text-green-600 font-semibold">FREE</span></div>
          <div className="flex justify-between font-extrabold text-blue-900 text-base pt-1 border-t">
            <span>Kul</span><span>Rs {price}</span>
          </div>
          <p className="text-xs text-gray-400 pt-1">Isme platform service charge ({rate}%) shamil hai</p>
        </div>
        <button onClick={placeOrder} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-60">
          {saving ? "Ruko..." : "Order Karo - Rs " + price}
        </button>
      </main>
      <BottomNav />
    </>
  );
}
