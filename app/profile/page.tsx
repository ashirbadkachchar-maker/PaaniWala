"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getMobile } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Profile(){
  const router = useRouter();
  const [m,setM]=useState<string|null>(null);
  const [p,setP]=useState<any>(null);
  const [lastOrderId,setLastOrderId]=useState<string>("");
  const [loading,setLoading]=useState(true);

  // Edit + GPS states
  const [editing,setEditing]=useState(false);
  const [editName,setEditName]=useState("");
  const [editAddress,setEditAddress]=useState("");
  const [editLoc,setEditLoc]=useState<{lat:number,lng:number}|null>(null);
  const [locMsg,setLocMsg]=useState("");
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    const mobile = getMobile();
    setM(mobile);
    setLastOrderId(localStorage.getItem("pw_last_order") || "");
    if(mobile){
      supabase.from("profiles").select("*").eq("mobile",mobile).maybeSingle()
       .then(({data})=>{
          setP(data);
          setLoading(false);
          if(data){
            setEditName(data.name || "");
            setEditAddress(data.address || "");
            if(data.lat && data.lng){
              setEditLoc({lat:Number(data.lat), lng:Number(data.lng)});
            }
          }
        });
    } else {
      setLoading(false);
    }
  },[]);

  const getLocation = () => {
    setLocMsg("Location le raha hoon...");
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        setEditLoc({lat:pos.coords.latitude, lng:pos.coords.longitude});
        setLocMsg(`GPS mil gaya! ${pos.coords.latitude.toFixed(5)}`);
      },
      ()=>setLocMsg("Location allow karo"),
      {enableHighAccuracy:true, timeout:15000}
    );
  };

  const saveProfile = async () => {
    if(!editName.trim()){ alert("Naam dalo"); return; }
    setSaving(true);
    const payload:any = { name: editName.trim(), address: editAddress.trim() };
    if(editLoc){ payload.lat = editLoc.lat; payload.lng = editLoc.lng; }
    let {error} = await supabase.from("profiles").update(payload).eq("mobile", m);
    if(error && error.message.includes("column")){
      const {lat,lng,...rest}=payload;
      rest.address = `${payload.address} | GPS: ${editLoc?.lat},${editLoc?.lng}`;
      const {error:err2} = await supabase.from("profiles").update(rest).eq("mobile", m);
      error = err2;
    }
    setSaving(false);
    if(error) alert(error.message);
    else { setP({...p,...payload}); setEditing(false); }
  };

  const logout=()=>{
    localStorage.removeItem("pw_mobile");
    localStorage.removeItem("pw_last_order");
    router.push("/login");
  };

  if(loading) return <><Header /><main className="p-6 text-center">Loading...</main><BottomNav /></>;
  if(!m) return <><Header /><main className="p-6 text-center space-y-3"><p>Login nahi kiya</p><Link href="/login" className="gold-btn px-6 py-2 rounded-xl text-white">Login Karo</Link></main><BottomNav /></>;

  const hasGps = editLoc || (p?.lat && p?.lng);
  const mapUrl = hasGps? `https://www.google.com/maps?q=${editLoc?.lat||p?.lat},${editLoc?.lng||p?.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p?.address||"Jodhpur")}`;

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 pb-24">
        <h2 className="text-xl font-extrabold text-blue-900">Meri Profile</h2>
        <div className="gold-card rounded-2xl p-4 space-y-3">
          <div className="flex justify-between">
            <div className="flex-1">
              <p className="font-extrabold text-lg">{p?.name || "Customer"}</p>
              <p className="text-sm text-gray-500">+91 {m}</p>
              <p className="text-sm text-gray-600 mt-1">{p?.address || "Address nahi hai"}</p>
              {hasGps && <p className="text-[11px] text-green-700 bg-green-50 rounded px-2 py-1 mt-2">📍 GPS: {Number(hasGps && (editLoc?.lat||p?.lat)).toFixed(5)}</p>}
            </div>
            <button onClick={()=>setEditing(!editing)} className="text-xs font-bold text-blue-600 border rounded-xl px-3 py-1.5">{editing?"Cancel":"Edit"}</button>
          </div>
          {hasGps && <a href={mapUrl} target="_blank" className="block bg-blue-900 text-white text-center py-2.5 rounded-xl text-sm">📍 Map pe Dekho</a>}
          {editing && (
            <div className="border-t pt-3 space-y-3">
              <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Naam" className="w-full border-2 border-amber-400 rounded-xl px-3 py-2.5 text-sm font-bold" />
              <textarea value={editAddress} onChange={e=>setEditAddress(e.target.value)} placeholder="Pura Address" className="w-full border-2 border-amber-400 rounded-xl px-3 py-2.5 text-sm font-bold h-20" />
              <button onClick={getLocation} className="w-full bg-blue-900 text-white font-bold py-2.5 rounded-xl text-xs">📍 Meri Location Lo</button>
              <p className="text-[11px] text-gray-500">{locMsg}</p>
              <button onClick={saveProfile} disabled={saving} className="w-full gold-btn text-white font-bold py-3 rounded-xl">{saving?"Save...":"Save Karo"}</button>
            </div>
          )}
        </div>
        <Link href="/orders" className="border-2 rounded-2xl p-4 flex gap-3"><span>🚚</span><span className="flex-1 font-semibold">Mere Orders</span><span>›</span></Link>
        {lastOrderId && <Link href={"/track/"+lastOrderId} className="border-2 border-blue-100 bg-blue-50 rounded-2xl p-4 flex gap-3"><span>📍</span><span className="flex-1 font-semibold">Last Order Track - {lastOrderId}</span><span>›</span></Link>}
        <Link href="/address" className="border-2 rounded-2xl p-4 flex gap-3"><span>🏠</span><span className="flex-1 font-semibold">Address Badlo</span><span>›</span></Link>
        <button onClick={logout} className="border-2 border-red-100 bg-red-50 w-full rounded-2xl p-4 flex gap-3"><span>🚪</span><span className="flex-1 font-semibold text-red-600 text-left">Logout</span><span>›</span></button>
      </main>
      <BottomNav />
    </>
  )
}
