"use client";
import { useEffect, useState, useRef } from "react";
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

function parseAddress(addr: string){
  if(!addr) return { permanent: "N/A", current: "", hasGPS: false };
  const parts = addr.split("|");
  let permanent = addr;
  let currentGPS = "";
  let hasGPS = false;
  if(addr.includes("PERMANENT:") || addr.includes("CURRENT")){
    parts.forEach(p=>{
      if(p.toUpperCase().includes("PERMANENT")) permanent = p.replace(/PERMANENT:/i,"").trim();
      if(p.toUpperCase().includes("CURRENT GPS") || p.toUpperCase().includes("GPS:")) {
        currentGPS = p.replace(/CURRENT GPS:/i,"").replace(/GPS:/i,"").trim();
        hasGPS = true;
      }
    });
  } else {
    permanent = parts[0].trim();
    if(parts.length > 1 && parts[1].match(/[\d]+\.[\d]+/)){
      currentGPS = parts[1].trim();
      hasGPS = true;
    }
  }
  return { permanent, current: currentGPS, hasGPS };
}

export default function OrderDetail({ params }: { params: { oid: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  // IN-APP NAVIGATION STATES
  const [showNav, setShowNav] = useState(false);
  const [myPos, setMyPos] = useState<{lat:number,lng:number}|null>(null);
  const [dist, setDist] = useState("");
  const mapRef = useRef<any>(null);
  const watchIdRef = useRef<number| null>(null);

  const load = async () => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller/login"); return; }
    const { data } = await supabase.from("orders").select("*").eq("id", params.oid).eq("seller_id", sid).maybeSingle();
    if (!data) { setNotFound(true); return; }
    setOrder(data);
  };

  useEffect(() => { load(); }, []);

  // Load Leaflet CSS
  useEffect(()=>{
    if(typeof window!== "undefined" &&!document.getElementById("leaflet-css")){
      const link = document.createElement("link");
      link.id="leaflet-css";
      link.rel="stylesheet";
      link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  },[]);

  const startInAppNav = () => {
    if(!order?.lat ||!order?.lng){
      setMsg("Is order me GPS nahi hai, sirf address se navigation hoga");
      return;
    }
    setShowNav(true);
    // Get live location
    if("geolocation" in navigator){
      navigator.geolocation.getCurrentPosition(p=>{
        setMyPos({lat:p.coords.latitude,lng:p.coords.longitude});
      });
      watchIdRef.current = navigator.geolocation.watchPosition(p=>{
        setMyPos({lat:p.coords.latitude,lng:p.coords.longitude});
      }, null, {enableHighAccuracy:true}) as unknown as number;
    }
  };

  // Draw Map when showNav + myPos + order lat lng ready
  useEffect(()=>{
    if(!showNav ||!myPos ||!order?.lat ||!order?.lng) return;
    const init = async()=>{
      // @ts-ignore
      if(!window.L){
        await new Promise<void>((res,rej)=>{
          const s=document.createElement("script");
          s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          s.onload=()=>res();
          s.onerror=()=>rej();
          document.body.appendChild(s);
        });
      }
      // @ts-ignore
      const L = window.L;
      if(mapRef.current){ mapRef.current.remove(); }
      const map = L.map("inapp-map").setView([myPos.lat, myPos.lng], 14);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      // Markers
      const myIcon = L.divIcon({html:"🛵", className:"text-2xl"});
      const destIcon = L.divIcon({html:"📍", className:"text-2xl"});
      L.marker([myPos.lat, myPos.lng], {icon: myIcon}).addTo(map).bindPopup("Aap yaha ho");
      L.marker([order.lat, order.lng], {icon: destIcon}).addTo(map).bindPopup("Delivery yaha");

      // OSRM Route (free)
      try{
        const url = `https://router.project-osrm.org/route/v1/driving/${myPos.lng},${myPos.lat};${order.lng},${order.lat}?overview=full&geometries=geojson`;
        const r = await fetch(url);
        const j = await r.json();
        if(j.routes && j.routes[0]){
          const coords = j.routes[0].geometry.coordinates.map((c:any)=>[c[1], c[0]]);
          L.polyline(coords, {color:"#1e3a8a", weight:5}).addTo(map);
          map.fitBounds(L.polyline(coords).getBounds(), {padding:[30,30]});
          const km = (j.routes[0].distance/1000).toFixed(1);
          const min = Math.round(j.routes[0].duration/60);
          setDist(`${km} km • ${min} min`);
        }
      }catch(e){
        // fallback straight line
        L.polyline([[myPos.lat, myPos.lng],[order.lat, order.lng]], {color:"#1e3a8a", dashArray:"10 10"}).addTo(map);
      }
    };
    init();
    return ()=>{ if(watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); }
  },[showNav, myPos, order]);

  const setStatus = async (st: string) => {
    if(st === "Pahuncha" && order?.status === "Raste Me Hai"){
      if(!otp || otp.length < 4){ setMsg("Buyer se 4-digit delivery OTP lo"); return; }
      const expected = String(order.delivery_otp || "").trim();
      if(!expected){ setMsg("Is order me OTP set nahi hai"); return; }
      if(otp!== expected){ setMsg("Galat OTP! Buyer se sahi OTP lo"); return; }
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
  const parsed = parseAddress(order.address);
  const currentMapUrl = order.lat && order.lng? `https://www.google.com/maps?q=${order.lat},${order.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;

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
          <p className="text- font-bold text-gray-400 uppercase">Permanent Address (Registration Fixed)</p>
          <p className="font-bold text-blue-900 text-">{parsed.permanent}</p>
        </div>

        {/* IN-APP NAVIGATION BOX */}
        <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 space-y-3">
          <p className="text- font-bold text-blue-700 uppercase">📍 Current Delivery GPS - Yaha Jana Hai</p>
          {order.lat && order.lng? (
            <p className="font-extrabold text-blue-900 text-">{order.lat.toFixed(6)}, {order.lng.toFixed(6)}</p>
          ) : (
            <p className="font-bold text-amber-700 text-sm">{parsed.current || order.address}</p>
          )}

          {!showNav? (
            <button onClick={startInAppNav} className="w-full bg-[#1e3a8a] text-white font-bold py-3 rounded-xl">🗺️ App me hi Navigation Chalu Karo</button>
          ) : (
            <div className="space-y-2">
              <div className="bg-white rounded-xl p-2 flex justify-between text-xs font-bold"><span>Live Distance</span><span className="text-blue-900">{dist || "Calculating..."}</span></div>
              <div id="inapp-map" className="w-full h- rounded-xl border-2 border-blue-900 overflow-hidden"></div>
              <p className="text- text-gray-600 text-center">🛵 Neela dot aap ho, 📍 delivery location. Map app ke andar hi chalega, Zomato jaisa.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a href={currentMapUrl} target="_blank" className="bg-white border border-blue-200 text-blue-900 text-center font-bold py-2.5 rounded-xl text-xs">Google me Kholo</a>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.lng}&travelmode=driving`} target="_blank" className="bg-blue-900 text-white text-center font-bold py-2.5 rounded-xl text-xs">🚗 Driving Mode</a>
          </div>
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Slot</span><span className="font-bold text-sm">{order.delivery_slot}</span></div>
        </div>

        <div className="gold-card rounded-2xl p-4 space-y-2 border-amber-100">
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Buyer Mobile</span><span className="text- font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">🔒 Protected</span></div>
          <div className="flex justify-between items-center"><span className="font-extrabold text-sm tracking-wider">{revealed? "+91 "+order.mobile : "+91 "+maskMobile(order.mobile)}</span>{revealed? <a href={"tel:"+order.mobile} className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold">📞 Call</a> : <span className="text- font-bold text-amber-700">Delivery ke baad khulega</span>}</div>
        </div>

        {st!== "Cancel" && (
          <div className="gold-card rounded-2xl p-4"><p className="font-bold text-sm mb-3">Status Progress</p><div className="flex items-center">{steps.map((s, i) => (<div key={s} className="flex-1 flex items-center"><div className="flex flex-col items-center"><div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold " + (i <= stepIdx? "gold-btn" : "bg-gray-200 text-gray-400")}>{i + 1}</div><span className={"text- mt-1 font-semibold " + (i <= stepIdx? "text-blue-900" : "text-gray-400")}>{s}</span></div>{i < steps.length - 1 && <div className={"flex-1 h-1 mx-1 rounded " + (i < stepIdx? "bg-amber-400" : "bg-gray-200")} />}</div>))}</div></div>
        )}

        {st === "Raste Me Hai" && (
          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 space-y-3"><p className="font-extrabold text-blue-900 text-sm">Delivery OTP - Buyer se lo</p><input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="1234" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold tracking-widest text-center w-full outline-none focus:border-blue-900" inputMode="numeric"/></div>
        )}

        <div className="space-y-2">
          {st === "Naya" && <><button onClick={() => setStatus("Confirm")} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">✓ Confirm Karo</button><button onClick={() => setStatus("Cancel")} className="w-full border-2 border-red-200 text-red-500 font-bold py-3 rounded-2xl">✗ Reject</button></>}
          {st === "Confirm" && <button onClick={() => setStatus("Raste Me Hai")} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">🚚 Raste Me Bhejo - Navigation Chalu</button>}
          {st === "Raste Me Hai" && <button onClick={() => setStatus("Pahuncha")} disabled={saving} className="w-full bg-green-600 text-white text-lg font-bold py-3 rounded-2xl">✓ OTP se Pahuncha - Complete</button>}
          {st === "Pahuncha" && <p className="text-center font-bold text-green-600 bg-green-50 rounded-2xl py-3">✓ Order poora</p>}
          {msg && <p className="text-xs font-bold text-center text-amber-700 bg-amber-50 rounded-lg p-2">{msg}</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
