"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  const [myPos, setMyPos] = useState<{lat:number,lng:number}|null>(null);
  const [dist, setDist] = useState("Location le raha hoon...");
  const [steps, setSteps] = useState<any[]>([]);
  const [isNav, setIsNav] = useState(false);
  const mapRef = useRef<any>(null);
  const myMarkerRef = useRef<any>(null);
  const routeRef = useRef<any>(null);
  const watchRef = useRef<number| null>(null);

  useEffect(()=>{
    const sid = localStorage.getItem("pw_seller_id");
    if(!sid){ router.push("/seller/login"); return; }
    supabase.from("orders").select("*").eq("id", params.oid).eq("seller_id", sid).maybeSingle().then(({data})=>{ if(data) setOrder(data); });
    if(!document.getElementById("leaflet-css")){
      const l=document.createElement("link"); l.id="leaflet-css"; l.rel="stylesheet"; l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(l);
    }
  },[]);

  // Start Live Navigation
  const startLive = () => {
    const buyer = getBuyerPos(order);
    if(!buyer){ alert("Is order me GPS nahi hai"); return; }
    setIsNav(true);
    if("geolocation" in navigator){
      watchRef.current = navigator.geolocation.watchPosition(p=>{
        setMyPos({lat:p.coords.latitude, lng:p.coords.longitude});
      }, null, {enableHighAccuracy:true, maximumAge:0}) as unknown as number;
    }
  };

  // Init map + live update
  useEffect(()=>{
    if(!order ||!isNav) return;
    const buyer = getBuyerPos(order);
    if(!buyer) return;
    const run = async()=>{
      // @ts-ignore
      if(!window.L){ await new Promise<void>(r=>{ const s=document.createElement("script"); s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload=()=>r(); document.body.appendChild(s); }); }
      // @ts-ignore
      const L = window.L;
      if(!mapRef.current){
        const map = L.map("live-map").setView([buyer.lat, buyer.lng], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        L.marker([buyer.lat, buyer.lng], {icon: L.divIcon({html:"<div style='font-size:32px'>📍</div>", className:""})}).addTo(map).bindPopup("Yaha delivery karna hai");
        mapRef.current = map;
      }
      const map = mapRef.current;
      if(!myPos) return;

      // My marker live move
      if(!myMarkerRef.current){
        myMarkerRef.current = L.marker([myPos.lat, myPos.lng], {icon: L.divIcon({html:"<div style='font-size:30px'>🛵</div>", className:""})}).addTo(map);
      } else {
        myMarkerRef.current.setLatLng([myPos.lat, myPos.lng]);
      }
      map.panTo([myPos.lat, myPos.lng]);

      // Route with steps
      try{
        const url = `https://router.project-osrm.org/route/v1/driving/${myPos.lng},${myPos.lat};${buyer.lng},${buyer.lat}?overview=full&geometries=geojson&steps=true`;
        const res = await fetch(url); const j = await res.json();
        if(j.routes?.[0]){
          const coords = j.routes[0].geometry.coordinates.map((c:any)=>[c[1],c[0]]);
          if(routeRef.current) map.removeLayer(routeRef.current);
          routeRef.current = L.polyline(coords, {color:"#1e3a8a", weight:6}).addTo(map);
          setDist(`${(j.routes[0].distance/1000).toFixed(1)} km • ${Math.round(j.routes[0].duration/60)} min`);
          const allSteps = j.routes[0].legs[0]?.steps?.slice(0,6) || [];
          setSteps(allSteps);
        }
      }catch{}
    };
    run();
  },[myPos, order, isNav]);

  useEffect(()=>{ return()=>{ if(watchRef.current) navigator.geolocation.clearWatch(watchRef.current); if(mapRef.current) mapRef.current.remove(); } },[]);

  if(!order) return <main className="p-6 text-center text-gray-400">Loading...</main>;
  const buyer = getBuyerPos(order);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto">
        <Link href="/seller/orders" className="text-blue-600 font-bold text-sm">← Orders</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Order Detail</h2>

        <div className="gold-card rounded-2xl p-4"><p className="font-bold">{order.order_id} - {order.item_name}</p><p className="text-amber-600 font-extrabold">Rs {order.price}</p></div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 space-y-3">
          <p className="font-extrabold text-blue-900 text-xs">📍 CURRENT DELIVERY GPS</p>
          <p className="font-bold text-blue-900 text-sm">{buyer? `${buyer.lat.toFixed(6)}, ${buyer.lng.toFixed(6)}` : order.address}</p>

          {!isNav? (
            <button onClick={startLive} className="w-full bg-[#1e3a8a] text-white font-bold py-3 rounded-xl">▶️ Live Navigation Chalu Karo</button>
          ) : (
            <>
              <div className="bg-white rounded-xl p-2 flex justify-between text-xs font-bold"><span>Live Distance</span><span className="text-blue-900">{dist}</span></div>
              <div id="live-map" className="w-full h- rounded-xl border-2 border-[#1e3a8a] bg-white"></div>
              <div className="bg-white rounded-xl p-3 space-y-2 max-h- overflow-y-auto">
                <p className="font-bold text-xs text-blue-900">Kaha se jana hai:</p>
                {steps.length===0 && <p className="text-xs text-gray-500">Rasta load ho raha hai...</p>}
                {steps.map((s:any,i:number)=>(
                  <p key={i} className="text-xs flex gap-2"><span>➡️</span><span>{s.maneuver?.instruction || s.name || `Step ${i+1}`}</span></p>
                ))}
              </div>
              <p className="text- text-center">🛵 dot live hilega, blue line road ka rasta hai</p>
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
