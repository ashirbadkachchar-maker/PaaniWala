"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function RegisterForm(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/home";
  const [name,setName]=useState(""); const [mobile,setMobile]=useState(""); const [address,setAddress]=useState(""); const [area,setArea]=useState(""); const [pin,setPin]=useState(""); const [confirmPin,setConfirmPin]=useState("");
  const [loc,setLoc]=useState<{lat:number,lng:number}|null>(null);
  const [locMsg,setLocMsg]=useState("GPS Location lo - seller ko sahi jagah milegi"); const [locLoading,setLocLoading]=useState(false);
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);

  const getLocation=()=>{
    setLocLoading(true); setLocMsg("Location li ja rahi hai...");
    navigator.geolocation.getCurrentPosition(p=>{
      setLoc({lat:p.coords.latitude,lng:p.coords.longitude}); setLocMsg(`GPS mil gaya! ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`); setLocLoading(false);
    },()=>{setLocMsg("Location allow karo"); setLocLoading(false);},{enableHighAccuracy:true,timeout:15000});
  };

  const doRegister=async()=>{
    const cleanMobile=mobile.replace(/\D/g,"").slice(-10); const cleanPin=pin.replace(/\D/g,"").slice(0,6);
    if(!name.trim()){setErr("Naam dalo"); return;} if(cleanMobile.length<10){setErr("Sahi mobile dalo"); return;} if(!address.trim()){setErr("Pura address dalo"); return;} if(cleanPin.length<4){setErr("4-digit PIN banao"); return;} if(cleanPin!==confirmPin.replace(/\D/g,"").slice(0,6)){setErr("PIN confirm nahi hua"); return;} if(!loc){setErr("Pehle GPS Location lo"); return;}
    setLoading(true);
    const {data:exists}=await supabase.from("profiles").select("id").eq("mobile",cleanMobile).maybeSingle();
    if(exists){setErr("Ye mobile pehle se registered hai!"); setLoading(false); return;}
    const payload:any={mobile:cleanMobile,password:cleanPin,name:name.trim(),address:address.trim()+(area?`, ${area}`:""),lat:loc.lat,lng:loc.lng};
    let {error}=await supabase.from("profiles").insert(payload);
    if(error && error.message.includes("column")){ // agar lat/lng column nahi hai to address me daal do
      const {lat,lng,...rest}=payload; rest.address=`${payload.address} | GPS: ${loc.lat},${loc.lng}`;
      const {error:error2}=await supabase.from("profiles").insert(rest); error=error2;
    }
    if(error){setErr(error.message); setLoading(false); return;}
    localStorage.setItem("pw_mobile",cleanMobile); setLoading(false); router.push(nextUrl);
  };

  return(
    <main className="flex-1 p-5 space-y-4 bg-[#FFFBF2] min-h-screen pb-28">
      <Link href="/login" className="text-blue-600 font-bold text-sm">← Login</Link>
      <h2 className="text-2xl font-extrabold text-blue-900">Naya Buyer Register</h2>
      <div className="space-y-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Aapka Naam *" className="w-full border-2 border-amber-400 rounded-2xl px-4 py-3 font-bold bg-white" />
        <div className="flex items-center gap-2 border-2 border-amber-400 rounded-2xl px-4 py-3 bg-white"><span className="font-extrabold border-r-2 border-amber-300 pr-3">+91</span><input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile *" className="flex-1 outline-none font-bold" inputMode="numeric" /></div>
        <textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="Pura Address *" className="w-full border-2 border-amber-400 rounded-2xl px-4 py-3 font-bold bg-white h-20" />
        <input value={area} onChange={e=>setArea(e.target.value)} placeholder="Area / Landmark" className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-bold bg-white" />
        <div className="rounded-2xl p-4 space-y-2 border-2 border-amber-200 bg-white"><p className="font-extrabold text-sm">📍 GPS Location *</p><p className="text-xs text-gray-500">{locMsg}</p><button onClick={getLocation} disabled={locLoading} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl">{locLoading?"Le raha hoon...":loc?"✓ GPS Mil Gaya":"📍 Meri Location Lo"}</button>{loc && <a href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} target="_blank" className="block text-center text-xs text-blue-600 font-bold">Map pe dekho</a>}</div>
        <input value={pin} onChange={e=>setPin(e.target.value)} type="password" placeholder="4-Digit PIN Banao *" className="w-full border-2 border-amber-400 rounded-2xl px-4 py-3 font-bold bg-white" inputMode="numeric" />
        <input value={confirmPin} onChange={e=>setConfirmPin(e.target.value)} type="password" placeholder="PIN Confirm *" className="w-full border-2 border-amber-400 rounded-2xl px-4 py-3 font-bold bg-white" inputMode="numeric" />
        {err && <p className="text-red-600 bg-red-50 rounded-xl py-2 text-center text-sm font-bold">{err}</p>}
        <button onClick={doRegister} disabled={loading} className="w-full py-3.5 rounded-2xl text-white font-extrabold gold-btn">{loading?"Register ho raha...":"Register Karo - GPS ke Saath"}</button>
      </div>
    </main>
  )
}
export default function Register(){ return <Suspense><RegisterForm/></Suspense> }
