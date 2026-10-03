"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const steps = ["Naya", "Confirm", "Raste Me Hai", "Pahuncha"];
function maskMobile(m: string){ return String(m).replace(/\D/g,"").slice(0,2)+"******"+String(m).replace(/\D/g,"").slice(-2); }
function canReveal(s: string){ return s==="Pahuncha"; }

function getBuyerPos(order:any){
  if(order?.lat && order?.lng) return {lat:Number(order.lat), lng:Number(order.lng)};
  if(order?.delivery_lat && order?.delivery_lng) return {lat:Number(order.delivery_lat), lng:Number(order.delivery_lng)};
  const m = String(order?.address||"").match(/(\d{2}\.\d+)\s*,\s*(\d{2,3}\.\d+)/);
  if(m) return {lat:Number(m[1]), lng:Number(m[2])};
  return null;
}

export default function OrderDetail({ params }: { params: { oid: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [otp, setOtp] = useState(""); const [msg, setMsg] = useState(""); const [saving, setSaving] = useState(false);
  const [myPos, setMyPos] = useState<{lat:number,lng:number}|null>(null);
  const [dist, setDist] = useState("Location le raha hoon...");
  const [showMap, setShowMap] = useState(true); // Map hamesha dikhega
  const mapRef = useRef<any>(null);

  useEffect(()=>{
    const sid = localStorage.getItem("pw_seller_id");
    if(!sid){ router.push("/seller/login"); return; }
    supabase.from("orders").select("*").eq("id", params.oid).eq("seller_id", sid).maybeSingle().then(({data})=>{ if(data) setOrder(data); });
  },[]);

  useEffect(()=>{
    if(typeof window!=="undefined" &&!document.getElementById("leaflet-css")){
      const l=document.createElement("link"); l.id="leaflet-css"; l.rel="stylesheet"; l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(l);
    }
    // Seller live location lo
    if("geolocation" in navigator){
      navigator.geolocation.getCurrentPosition(p=> setMyPos({lat:p.coords.latitude, lng:p.coords.longitude}), ()=> setDist("Location allow karo"));
    }
  },[]);

  useEffect(()=>{
    if(!order ||!showMap) return;
    const buyer = getBuyerPos(order);
    if(!buyer) return;
    const init = async()=>{
      // @ts-ignore
      if(!window.L){ await new Promise<void>(r=>{ const s=document.createElement("script"); s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload=()=>r(); document.body.appendChild(s); }); }
      // @ts-ignore
      const L = window.L;
      if(mapRef.current) mapRef.current.remove();
      const center = myPos || buyer;
      const map = L.map("full-map", {zoomControl:true}).setView([center.lat, center.lng], 15);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      // Buyer pin - hamesha dikhega
      L.marker([buyer.lat, buyer.lng], {icon: L.divIcon({html:"<div style='font-size:28px'>📍</div>", className:""})}).addTo(map).bindPopup("Delivery yaha karna hai");

      if(myPos){
        L.marker([myPos.lat, myPos.lng], {icon: L.divIcon({html:"<div style='font-size:28px'>🛵</div>", className:""})}).addTo(map).bindPopup("Aap yaha ho");
        // Route
        try{
          const url = `https://router.project-osrm.org/route/v1/driving/${myPos.lng},${myPos.lat};${buyer.lng},${buyer.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url); const j = await res.json();
          if(j.routes?.[0]){
            const coords = j.routes[0].geometry.coordinates.map((c:any)=>[c[1],c[0]]);
            const poly = L.polyline(coords, {color:"#1e3a8a", weight:6}).addTo(map);
            map.fitBounds(poly.getBounds(), {padding:[40,40]});
            const km = (j.routes[0].distance/1000).toFixed(1);
            const min = Math.round(j.routes[0].duration/60);
            if(km==="0.0") setDist(`Same location pe ho - ${km} km (test order)`);
            else setDist(`${km} km • ${min} min • Zomato jaisa live route`);
          }
        }catch{
          L.polyline([[myPos.lat,myPos.lng],[buyer.lat,buyer.lng]], {color:"#1e3a8a", weight:5, dashArray:"10 10"}).addTo(map);
          setDist("Seedha rasta (road data nahi mila)");
        }
      } else {
        setDist("Aapki location le raha hoon...");
      }
    };
    init();
  },[order, myPos, showMap]);

  const setStatus = async(st:string)=>{
    if(st==="Pahuncha" && order?.status==="Raste Me Hai"){
      if(otp.length<4){ setMsg("OTP dalo"); return; }
      if(order.delivery_otp && otp!==String(order.delivery_otp)){ setMsg("Galat OTP"); return; }
    }
    setSaving(true); await supabase.from("orders").update({status:st}).eq("id", params.oid); setSaving(false); location.reload();
  };

  if(!order) return <main className="p-6 text-center text-gray-400">Loading...</main>;

  const buyer = getBuyerPos(order);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto">
        <Link href="/seller/orders" className="text-blue-600 font-bold text-sm">← Orders</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Order Detail</h2>

        <div className="gold-card rounded-2xl p-4">
          <p className="font-bold text-blue-900 text-sm">Order {order.order_id} - {order.item_name}</p>
          <p className="text-amber-600 font-extrabold">Rs {order.price} | Kamai Rs {order.seller_earning}</p>
        </div>

        {/* FULL MAP NAVIGATION */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 space-y-3">
          <p className="font-extrabold text-blue-900 text-">📍 CURRENT DELIVERY GPS - YAHA JANA HAI</p>
          <p className="font-bold text-blue-900">{buyer? `${buyer.lat.toFixed(6)}, ${buyer.lng.toFixed(6)}` : "GPS nahi hai"}</p>

          <div className="bg-white rounded-xl p-2 flex justify-between text-xs font-bold"><span>Distance</span><span className="text-blue-900">{dist}</span></div>

          {/* YE MAP HAMESHA PURA DIKHEGA */}
          <div id="full-map" className="w-full h- rounded-xl border-2 border-[#1e3a8a] bg-white"></div>

          <p className="text- text-center text-gray-600">🛵 Aap • 📍 Buyer — Naya driver alag jagah se hoga to pura road wala route ayega, 0 km nahi</p>
          <p className="text- text-center text-amber-700 font-bold">Test karne ke liye phone ki location change karke dekho ya dusre area se order banao</p>
          <div className="flex justify-between text-xs"><span className="text-gray-500">Slot</span><span className="font-bold">{order.delivery_slot}</span></div>
        </div>

        <div className="space-y-2">
          {order.status==="Naya" && <button onClick={()=>setStatus("Confirm")} className="gold-btn w-full text-white font-bold py-3 rounded-2xl">✓ Confirm Karo</button>}
          {order.status==="Confirm" && <button onClick={()=>setStatus("Raste Me Hai")} className="gold-btn w-full text-white font-bold py-3 rounded-2xl">🚚 Raste Me Bhejo - Navigation Chalu</button>}
          {order.status==="Raste Me Hai" && <><input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Buyer OTP 4-digit" className="w-full border-2 rounded-xl p-3 text-center font-bold tracking-widest"/><button onClick={()=>setStatus("Pahuncha")} className="w-full bg-green-600 text-white font-bold py-3 rounded-2xl">✓ Pahuncha</button></>}
          {msg && <p className="text-xs font-bold text-red-600 text-center bg-red-50 p-2 rounded-xl">{msg}</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
