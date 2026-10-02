"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getMobile } from "@/lib/supabase";

const steps = ["Naya", "Confirm", "Raste Me Hai", "Pahuncha"];
const statusText: Record<string, string> = {
  "Naya": "Aapka order mil gaya hai",
  "Confirm": "Seller ne order confirm kar diya",
  "Raste Me Hai": "Paani raste me hai - thodi der me pahunchega!",
  "Pahuncha": "Paani pahunch gaya. Dhanyavaad!",
  "Cancel": "Ye order cancel ho gaya hai",
};

export default function TrackOrder({ params }: { params: { oid: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [notYours, setNotYours] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const mobile = getMobile();
    if (!mobile) {
      router.replace("/login?next=" + encodeURIComponent("/track/" + params.oid));
      return;
    }
    setCheckingAuth(false);

    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", params.oid)
        .maybeSingle();

      if (!data) { setNotFound(true); return; }
      if (data.mobile !== mobile) {
        setNotYours(true);
        return;
      }
      setOrder(data);
      if (data.seller_id) {
        const { data: s } = await supabase
          .from("sellers")
          .select("business_name,mobile,area")
          .eq("id", data.seller_id)
          .maybeSingle();
        if (s) setSeller(s);
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [params.oid, router]);

  if (checkingAuth) {
    return <main className="flex-1 p-6"><p className="text-center text-gray-400">Checking login...</p></main>;
  }

  if (notYours) {
    return (
      <>
        <Header />
        <main className="flex-1 p-6 text-center space-y-4">
          <p className="text-5xl">🔒</p>
          <p className="font-bold text-blue-900 text-lg">Ye order aapka nahi hai</p>
          <p className="text-sm text-gray-500">Aap sirf apne mobile se kiye gaye orders track kar sakte ho</p>
          <Link href="/orders" className="inline-block gold-btn text-white font-bold px-6 py-2.5 rounded-xl">Mere Orders</Link>
        </main>
        <BottomNav />
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Header />
        <main className="flex-1 p-6 text-center space-y-3">
          <p className="font-bold text-blue-900">Order nahi mila</p>
          <p className="text-sm text-gray-500">Order ID: {params.oid}</p>
          <Link href="/orders" className="text-blue-600 font-semibold text-sm">← Mere Orders</Link>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!order) {
    return <main className="flex-1 p-6"><p className="text-center text-gray-400">Order dhunda ja raha hai...</p></main>;
  }

  const st = order.status || "Naya";
  const stepIdx = steps.indexOf(st);
  const showDeliveryId = (st === "Raste Me Hai" || st === "Confirm") && order.delivery_otp;

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 pb-20">
        <div className="flex justify-between items-center">
          <Link href="/orders" className="text-blue-600 font-semibold text-sm">← Mere Orders</Link>
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">🔒 Secure - Sirf aap dekh sakte ho</span>
        </div>
        <h2 className="text-xl font-extrabold text-blue-900">Order Tracking</h2>

        <div className="gold-card rounded-2xl p-4 text-center">
          <p className="text-lg font-extrabold text-blue-900">{statusText[st] || st}</p>
          <p className="text-xs text-gray-500 mt-1">Order ID: {order.order_id}</p>
          <p className="text-xs text-gray-400">Mobile: +91 {order.mobile}</p>
        </div>

        {showDeliveryId && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 text-center space-y-2 shadow-sm">
            <p className="text-[11px] font-extrabold text-green-700 uppercase tracking-wider">✅ Delivery ID / OTP - Seller ko dikhao</p>
            <p className="text-5xl font-extrabold tracking-[0.2em] text-blue-900">{order.delivery_otp}</p>
            <p className="text-xs font-semibold text-gray-700">Seller jab paani leke aaye, tab ye 4-digit ID usko batana</p>
            <div className="bg-white rounded-xl p-2 text-[11px] text-left space-y-1">
              <p className="font-bold text-red-600">⚠️ Important:</p>
              <p className="text-gray-600">• Ye Delivery ID sirf aapke paas hai, seller ko nahi dikhti</p>
              <p className="text-gray-600">• Is ID ke bina seller fake delivery nahi kar payega</p>
              <p className="text-gray-600">• Order ID = {order.order_id} se delivery nahi hogi, is Delivery ID se hogi</p>
            </div>
          </div>
        )}

        {st === "Pahuncha" && order.delivery_otp && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-bold text-green-700">✅ Delivery ho gayi - ID {order.delivery_otp} se verify hui</p>
          </div>
        )}

        {st !== "Cancel" ? (
          <div className="gold-card rounded-2xl p-4">
            <div className="flex items-center">
              {steps.map((s, i) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={"w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold " + (i <= stepIdx ? "gold-btn" : "bg-gray-200 text-gray-400")}>
                      {i < stepIdx ? "✓" : i + 1}
                    </div>
                    <span className={"text-[10px] mt-1 text-center font-semibold " + (i <= stepIdx ? "text-blue-900" : "text-gray-400")}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={"flex-1 h-1 mx-1 rounded " + (i < stepIdx ? "bg-amber-400" : "bg-gray-200")} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center font-bold text-red-500 bg-red-50 rounded-2xl py-3">Ye order cancel ho gaya hai</p>
        )}

        {seller && (
          <div className="gold-card rounded-2xl p-4 flex justify-between items-center gap-2">
            <div>
              <p className="font-bold text-blue-900">{seller.business_name}</p>
              <p className="text-xs text-gray-500">{seller.area || ""}</p>
            </div>
            {seller.mobile && (
              <a href={"tel:+91" + seller.mobile} className="gold-btn text-white font-bold px-5 py-2.5 rounded-xl whitespace-nowrap">
                Call Karo
              </a>
            )}
          </div>
        )}

        <div className="gold-card rounded-2xl p-4 space-y-2">
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Item</span><span className="font-bold text-blue-900 text-sm">{order.item_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Qty</span><span className="font-bold text-blue-900 text-sm">{order.qty}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Kul Price</span><span className="font-extrabold text-amber-600">Rs {order.price}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Delivery</span><span className="font-bold text-blue-900 text-sm">{order.delivery_slot}</span></div>
          <div><span className="text-gray-500 text-sm">Address</span><p className="font-bold text-blue-900 text-sm">{order.address}</p></div>
          <div className="flex justify-between border-t pt-2"><span className="text-gray-500 text-sm">Order ID</span><span className="font-bold text-sm">{order.order_id}</span></div>
          {order.delivery_otp && <div className="flex justify-between"><span className="text-gray-500 text-sm">Delivery ID</span><span className="font-extrabold text-green-600 text-sm">{showDeliveryId ? order.delivery_otp : "•••• (Raste Me Hai pe dikhega)"}</span></div>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
