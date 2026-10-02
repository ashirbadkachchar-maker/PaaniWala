"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getMobile, makeOrderId } from "@/lib/supabase";

const times = ["Aaj Subah 8 Baje", "Aaj Shaam 5 Baje", "Kal Subah 8 Baje"];

export default function Checkout({ params }: { params: { pid: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [time, setTime] = useState(times[1]);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

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

  const ensureCustomerPassword = async (mobile: string) => {
    if (!mobile) return null;
    const { data: existing } = await supabase.from("profiles").select("id,password").eq("mobile", mobile).maybeSingle();
    if (!existing) {
      const pw = String(Math.floor(1000 + Math.random() * 9000));
      await supabase.from("profiles").insert({ mobile, password: pw, name: "Customer", address: "B-2-304, Arihant Anchal, Jodhpur" });
      return pw;
    }
    if (!existing.password) {
      const pw = String(Math.floor(1000 + Math.random() * 9000));
      await supabase.from("profiles").update({ password: pw }).eq("id", existing.id);
      return pw;
    }
    return null;
  };

  if (!product) {
    return (<><Header /><main className="flex-1 p-4"><p className="text-gray-400">Load ho raha hai...</p></main><BottomNav /></>);
  }

  // Single source - sab yahi se
  const q = product.item_type === "tanker"? 1 : qty;
  const unitWord = product.item_type === "camper"? "Camper" : "Bottle";
  const unitLabel = product.item_type === "camper"? " /can" : product.item_type === "tanker"? "" : " /bottle";
  const price = product.price * q;
  const rate = seller? seller.commission_rate || 5 : 5;
  const commission = Math.round((price * rate) / 100);

  const placeOrder = async () => {
    const mobile = getMobile();
    if (!mobile) {
      router.push("/login?next=" + encodeURIComponent("/order/" + params.pid));
      return;
    }
    setSaving(true);
    const generatedPw = await ensureCustomerPassword(mobile);
    const orderId = makeOrderId();

    await supabase.from("orders").insert({
      order_id: orderId,
      mobile: mobile,
      seller_id: product.seller_id,
      item_type: product.item_type,
      item_name: (product.item_type === "tanker"? "" : q + " x ") + product.item_name,
      qty: q,
      price: price,
      discount: 0,
      total: price,
      commission: commission,
      seller_earning: price - commission,
      delivery_slot: time,
      address: "B-2-304, Arihant Anchal, Jodhpur",
      status: "Raste Me Hai",
    });
    localStorage.setItem("pw_last_order", orderId);
    setSaving(false);
    if (generatedPw) setNewPassword(generatedPw);
    else router.push("/success");
  };

  if (newPassword) {
    return (
      <>
        <Header />
        <main className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full gold-btn flex items-center justify-center text-4xl text-white">✓</div>
          <h2 className="text-xl font-extrabold text-blue-900">Order Ho Gaya!</h2>
          <div className="gold-card rounded-2xl p-5 w-full space-y-2">
            <p className="text-sm text-gray-500">Aapka login password ban gaya hai:</p>
            <p className="text-5xl font-extrabold text-blue-900 tracking-widest">{newPassword}</p>
            <p className="text-xs text-gray-500">Mobile: {getMobile()}<br/>Agli baar isi mobile + password se login karo</p>
          </div>
          <p className="text-sm font-bold text-red-500">Iska screenshot le lo - dobara nahi dikhega!</p>
          <button onClick={() => router.push("/success")} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">Note Kar Liya - Aage Badho</button>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href={"/shop/" + product.seller_id} className="text-blue-600 font-semibold text-sm">← Wapas</Link>
        <h2 className="text-xl font-bold text-blue-900">Order Confirm Karo</h2>
        <div className="gold-card rounded-2xl p-4">
          <p className="font-bold text-blue-900">{product.item_name}</p>
          <p className="text-sm text-gray-500">{seller? seller.business_name : ""}</p>
          <p className="text-lg font-extrabold text-amber-600 mt-1">Rs {product.price}{unitLabel}</p>
        </div>
        {product.item_type!== "tanker" && (
          <div className="flex items-center justify-center gap-6 py-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-14 h-14 rounded-full gold-btn text-white text-3xl font-bold">-</button>
            <span className="text-2xl font-extrabold text-blue-900">{qty} {unitWord}</span>
            <button onClick={() => setQty(qty + 1)} className="w-14 h-14 rounded-full gold-btn text-white text-3xl font-bold">+</button>
          </div>
        )}
        <div>
          <p className="font-semibold text-blue-900 mb-2">Delivery Time</p>
          <div className="flex flex-wrap gap-2">
            {times.map((t) => (
              <button key={t} onClick={() => setTime(t)} className={"chip " + (time === t? "chip-on" : "chip-off")}>{t}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>B-2-304, Arihant Anchal, Jodhpur</span>
          <Link href="/address" className="text-blue-600 font-semibold">Badlo</Link>
        </div>
        <div className="border-2 border-gray-200 rounded-2xl p-4 text-sm space-y-1">
          <div className="flex justify-between"><span>{product.item_name}{product.item_type === "tanker"? "" : " x " + q}</span><span>Rs {price}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="text-green-600 font-semibold">FREE</span></div>
          <div className="flex justify-between font-extrabold text-blue-900 text-base pt-1 border-t"><span>Kul</span><span>Rs {price}</span></div>
          <p className="text-xs text-gray-400 pt-1">Isme platform service charge ({rate}%) shamil hai</p>
        </div>
        <button onClick={placeOrder} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-60">
          {saving? "Ruko..." : "Order Karo - Rs " + price}
        </button>
      </main>
      <BottomNav />
    </>
  );
}
