"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const steps = ["Naya", "Confirm", "Raste Me Hai", "Pahuncha"];

function maskMobile(m: string){
  if(!m) return "";
  const s = String(m).replace(/\D/g,"");
  return s.slice(0,2)+"******"+s.slice(-2);
}
function canReveal(status: string){
  return status === "Pahuncha" || status === "Delivered";
}

export default function OrderDetail({ params }: { params: { oid: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller/login"); return; }
    const { data } = await supabase.from("orders").select("*").eq("id", params.oid).eq("seller_id", sid).maybeSingle();
    if (!data) { setNotFound(true); return; }
    setOrder(data);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (st: string) => {
    if(st === "Pahuncha" && order?.status === "Raste Me Hai"){
      if(!otp || otp.length < 4){
        setMsg("Buyer se 4-digit delivery OTP lo - Order ID ke last 4 digit");
        return;
      }
      const expected = String(order.order_id).slice(-4);
      if(otp !== expected){
        setMsg("Galat OTP! Sahi OTP hai: "+expected+" (Demo - Order ID last 4)");
        return;
      }
    }
    setSaving(true);
    await supabase.from("orders").update({ status: st }).eq("id", params.oid);
    setSaving(false);
    setMsg("");
    load();
  };

  if (notFound) return <><Header /><main className="flex-1 p-6 text-center"><p className="font-bold">Order nahi mila</p><Link href="/seller/orders" className="text-blue-600">← Orders</Link></main><BottomNav /></>;
  if (!order) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  const st = order.status || "Naya";
  const stepIdx = steps.indexOf(st);
  const revealed = canReveal(st);
  const mapUrl = "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(order.address || "Jodhpur");

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 pb-24">
        <Link href="/seller/orders" className="text-blue-600 font-semibold text-sm">← Orders</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Order Detail</h2>
        
        <div className="gold-card rounded-2xl p-4 space-y-2">
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Order ID</span><span className="font-bold text-blue-900 text-sm">{order.order_id}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Item</span><span className="font-bold text-sm">{order.item_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Qty</span><span className="font-bold text-sm">{order.qty}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Kul Price</span><span className="font-extrabold text-amber-600">Rs {order.price}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Platform Fee</span><span className="font-bold text-red-500 text-sm">- Rs {order.commission || 0}</span></div>
          <div className="flex justify-between border-t pt-2"><span className="text-gray-500 text-sm">Aapki Kamai</span><span className="font-extrabold text-green-600">Rs {order.seller_earning || order.price}</span></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Delivery Address - Yaha jana hai (Always visible)</p>
          <p className="font-bold text-blue-900 text-[15px]">{order.address}</p>
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Slot</span><span className="font-bold text-sm">{order.delivery_slot}</span></div>
          <a href={mapUrl} target="_blank" className="block mt-2 bg-blue-900 text-white text-center font-bold py-2.5 rounded-xl text-sm">📍 Google Map pe Navigate karo</a>
        </div>

        <div className="gold-card rounded-2xl p-4 space-y-2 border-amber-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Buyer Mobile</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">🔒 Protected</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-sm tracking-wider">{revealed ? "+91 "+order.mobile : "+91 "+maskMobile(order.mobile)}</span>
            {revealed ? (
              <a href={"tel:"+order.mobile} className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold">📞 Call</a>
            ) : (
              <span className="text-[11px] font-bold text-amber-700">Delivery ke baad khulega</span>
            )}
          </div>
          {!revealed && <p className="text-[11px] text-gray-500">Seller ko address + Map se pahunchna hai. Mobile sirf rasta bhatakne pe chahiye, isliye hide hai. Commission safe rahega.</p>}
        </div>

        {st !== "Cancel" && (
          <div className="gold-card rounded-2xl p-4">
            <p className="font-bold text-sm mb-3">Status Progress</p>
            <div className="flex items-center">
              {steps.map((s, i) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold " + (i <= stepIdx ? "gold-btn" : "bg-gray-200 text-gray-400")}>{i + 1}</div>
                    <span className={"text-[10px] mt-1 font-semibold " + (i <= stepIdx ? "text-blue-900" : "text-gray-400")}>{s}</span>
                  </div>
                  {i < steps.length - 1 && <div className={"flex-1 h-1 mx-1 rounded " + (i < stepIdx ? "bg-amber-400" : "bg-gray-200")} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {st === "Raste Me Hai" && (
          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 space-y-3">
            <p className="font-extrabold text-blue-900 text-sm">Delivery OTP - Buyer se lo</p>
            <p className="text-xs text-gray-500">Buyer ke Order ID ke last 4 digit hi OTP hai</p>
            <div className="flex gap-2">
              <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="1234" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold tracking-widest text-center outline-none focus:border-blue-900" inputMode="numeric"/>
            </div>
            {msg && <p className="text-xs font-bold text-amber-700 bg-amber-50 rounded-lg p-2">{msg}</p>}
            <p className="text-[11px] text-gray-400">Demo OTP: {String(order.order_id).slice(-4)}</p>
          </div>
        )}

        <div className="space-y-2">
          {st === "Naya" && <><button onClick={() => setStatus("Confirm")} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">✓ Confirm Karo</button><button onClick={() => setStatus("Cancel")} className="w-full border-2 border-red-200 text-red-500 font-bold py-3 rounded-2xl">✗ Reject</button></>}
          {st === "Confirm" && <button onClick={() => setStatus("Raste Me Hai")} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">🚚 Raste Me Bhejo</button>}
          {st === "Raste Me Hai" && <button onClick={() => setStatus("Pahuncha")} disabled={saving} className="w-full bg-green-600 text-white text-lg font-bold py-3 rounded-2xl">✓ OTP se Pahuncha - Complete</button>}
          {st === "Pahuncha" && <p className="text-center font-bold text-green-600 bg-green-50 rounded-2xl py-3">✓ Order poora - Commission safe</p>}
          {msg && st !== "Raste Me Hai" && <p className="text-xs font-bold text-center text-amber-700">{msg}</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
