"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const steps = ["Naya", "Confirm", "Raste Me Hai", "Pahuncha"];

function maskMobile(m: string){
  const s = String(m).replace(/\D/g,"");
  return s.slice(0,2)+"******"+s.slice(-2);
}
function canReveal(s: string){ return s === "Pahuncha" || s === "Delivered"; }

function getBuyerLatLng(order:any): {lat:number,lng:number}|null{
  // sab possible field check - tera purana + naya dono cover
  if(order.lat && order.lng && Number(order.lat)>1) return {lat:Number(order.lat), lng:Number(order.lng)};
  if(order.delivery_lat && order.delivery_lng) return {lat:Number(order.delivery_lat), lng:Number(order.delivery_lng)};
  if(order.buyer_lat && order.buyer_lng) return {lat:Number(order.buyer_lat), lng:Number(order.buyer_lng)};
  // address me "26.24,72.94" ho to
  if(order.address){
    const m = String(order.address).match(/(\d{2}\.\d+)\s*,\s*(\d{2,3}\.\d+)/);
    if(m) return {lat:Number(m[1]), lng:Number(m[2])};
  }
  return null;
}

export default function OrderDetail({ params }: { params: { oid: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [otp, setOtp] = useState(""); const [msg, setMsg] = useState(""); const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // IN-APP NAV
  const [showMap, setShowMap] = useState(false);
  const [myPos, setMyPos] = useState<{lat:number,lng:number}|null>(null);
  const [dist, setDist] = useState("");
  const mapRef = useRef<any>(null);

  const load = async () => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller/login"); return; }
    const { data } = await supabase.from("orders").select("*").eq("id", params.oid).eq("seller_id", sid).maybeSingle();
    if (!data) { setNotFound(true); return; }
    setOrder(data);
  };
  useEffect(() => { load(); }, []);

  // Leaflet CSS load
  useEffect(()=>{
    if(typeof window!=="undefined" &&!document.getElementById("leaflet-css")){
      const l=document.createElement("link"); l.id="leaflet-css"; l.rel="stylesheet"; l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(l);
    }
  },[]);

  const startNav = () => {
    const buyer = getBuyerLatLng(order);
    if(!buyer){ setMsg("Is order me GPS save nahi hai - ye purana order hai. Naye orders me GPS ayega."); return; }
    setShowMap(true);
    if("geolocation" in navigator){
      navigator.geolocation.getCurrentPosition(p=> setMyPos({lat:p.coords.latitude, lng:p.coords.longitude}), ()=> setMsg("Location allow karo"), {enableHighAccuracy:true});
    }
  };

  // Map draw
  useEffect(()=>{
    if(!showMap ||!myPos ||!order) return;
    const buyer = getBuyerLatLng(order);
    if(!buyer) return;
    const run = async()=>{
      // @ts-ignore
      if(!window.L){
        await new Promise<void>((res)=>{ const s=document.createElement("script"); s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload=()=>res(); document.body.appendChild(s); });
      }
      // @ts-ignore
      const L = window.L;
      if(mapRef.current) mapRef.current.remove();
      const map = L.map("inapp-map").setView([myPos.lat, myPos.lng], 14);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([myPos.lat, myPos.lng], {icon: L.divIcon({html:"🛵", className:"text-2xl"})}).addTo(map);
      L.marker([buyer.lat, buyer.lng], {icon: L.divIcon({html:"📍", className:"text-2xl"})}).addTo(map);
      try{
        const url = `https://router.project-osrm.org/route/v1/driving/${myPos.lng},${myPos.lat};${buyer.lng},${buyer.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url); const j = await res.json();
        if(j.routes?.[0]){
          const coords = j.routes[0].geometry.coordinates.map((c:any)=>[c[1],c[0]]);
          L.polyline(coords, {color:"#1e3a8a", weight:5}).addTo(map);
          map.fitBounds(L.polyline(coords).getBounds(), {padding:[30,30]});
          setDist(`${(j.routes[0].distance/1000).toFixed(1)} km • ${Math.round(j.routes[0].duration/60)} min`);
        }
      }catch{
        L.polyline([[myPos.lat, myPos.lng],[buyer.lat, buyer.lng]], {color:"#1e3a8a", dashArray:"8 8"}).addTo(map);
      }
    };
    run();
  },[showMap, myPos, order]);

  const setStatus = async (st: string) => {
    if(st === "Pahuncha" && order?.status === "Raste Me Hai"){
      if(!otp || otp.length < 4){ setMsg("Buyer se OTP lo"); return; }
      const exp = String(order.delivery_otp || "").trim();
      if(exp && otp!==exp){ setMsg("Galat OTP"); return; }
    }
    setSaving(true);
    await supabase.from("orders").update({ status: st }).eq("id", params.oid);
    setSaving(false); load();
  };

  if (notFound) return <><Header /><main className="p-6 text-center"><p className="font-bold">Order nahi mila</p></main><BottomNav /></>;
  if (!order) return <main className="p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  const st = order.status || "Naya";
  const buyerPos = getBuyerLatLng(order);
  const stepIdx = steps.indexOf(st);
  const revealed = canReveal(st);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto">
        <Link href="/seller/orders" className="text-blue-600 font-semibold text-sm">← Orders</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Order Detail</h2>

        <div className="gold-card rounded-2xl p-4 space-y-2">
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Order ID</span><span className="font-bold text-blue-900 text-sm">{order.order_id}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Item</span><span className="font-bold text-sm">{order.item_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Qty</span><span className="font-bold text-sm">{order.qty}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Kul Price</span><span className="font-extrabold text-amber-600">Rs {order.price}</span></div>
          <div className="flex justify-between border-t pt-2"><span className="text-gray-500 text-sm">Aapki Kamai</span><span className="font-extrabold text-green-600">Rs {order.seller_earning || order.price}</span></div>
        </div>

        {/* CURRENT GPS - IN APP MAP */}
        <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 space-y-3">
          <p className="text- font-bold text-blue-700 uppercase">📍 CURRENT DELIVERY GPS - YAHA JANA HAI</p>
          {buyerPos? <p className="font-extrabold text-blue-900 text-">{buyerPos.lat.toFixed(6)}, {buyerPos.lng.toFixed(6)}</p> : <p className="font-bold text-amber-700 text-sm">GPS nahi hai (purana order) - Address: {order.address}</p>}

          {!showMap? (
            <button onClick={startNav} className="w-full bg-[#1e3a8a] text-white font-bold py-3 rounded-xl">🗺️ App me hi Navigation Chalu Karo</button>
          ) : (
            <div className="space-y-2">
              <div className="bg-white rounded-xl p-2 flex justify-between text-xs font-bold"><span>Distance</span><span>{dist || "Calculating..."}</span></div>
              <div id="inapp-map" className="w-full h- rounded-xl border-2 border-blue-900 overflow-hidden bg-white"></div>
              <p className="text- text-center text-gray-600">🛵 Aap, 📍 Buyer — Map app ke andar hi chalega, popup nahi khulega</p>
            </div>
          )}
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Slot</span><span className="font-bold text-sm">{order.delivery_slot}</span></div>
        </div>

        {msg && <p className="text-xs font-bold text-amber-700 bg-amber-50 rounded-lg p-2">{msg}</p>}

        <div className="space-y-2">
          {st === "Naya" && <><button onClick={() => setStatus("Confirm")} className="gold-btn w-full text-white font-bold py-3 rounded-2xl">✓ Confirm Karo</button><button onClick={() => setStatus("Cancel")} className="w-full border-2 border-red-200 text-red-500 font-bold py-3 rounded-2xl">✗ Reject</button></>}
          {st === "Confirm" && <button onClick={() => setStatus("Raste Me Hai")} className="gold-btn w-full text-white font-bold py-3 rounded-2xl">🚚 Raste Me Bhejo</button>}
          {st === "Raste Me Hai" && <><input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="Buyer OTP" className="w-full border-2 rounded-xl px-4 py-3 text-center font-bold tracking-widest" /><button onClick={() => setStatus("Pahuncha")} disabled={saving} className="w-full bg-green-600 text-white font-bold py-3 rounded-2xl">✓ Pahuncha - Complete</button></>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
