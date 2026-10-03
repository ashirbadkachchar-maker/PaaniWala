"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function LoginForm(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/home";
  const [mobile,setMobile]=useState("");
  const [name,setName]=useState("");
  const [permAddress,setPermAddress]=useState("");
  const [loc,setLoc]=useState<{lat:number,lng:number}|null>(null);
  const [locMsg,setLocMsg]=useState("");

  const getLocation=()=>{
    setLocMsg("GPS le raha hoon...");
    navigator.geolocation.getCurrentPosition(p=>{
      setLoc({lat:p.coords.latitude,lng:p.coords.longitude});
      setLocMsg(`GPS mil gaya: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`);
    },()=>setLocMsg("Location allow karo"),{enableHighAccuracy:true, timeout:15000});
  };

  const doLogin=async()=>{
    const clean=mobile.replace(/\D/g,"");
    if(clean.length<10){alert("Mobile sahi dalo");return;}
    if(!name.trim()||!permAddress.trim()){alert("Naam + Permanent Address dalo");return;}
    if(!loc){alert("GPS lo - permanent ke liye zaruri hai");return;}
    localStorage.setItem("pw_mobile",clean);
    // Permanent address + GPS profile me FIXED rahega
    let payload:any={mobile:clean, name:name.trim(), address:permAddress.trim(), lat:loc.lat, lng:loc.lng};
    let {error}=await supabase.from("profiles").upsert(payload,{onConflict:"mobile"});
    if(error && error.message.includes("column")){
      const {lat,lng,...rest}=payload;
      rest.address=`${payload.address} | GPS: ${loc.lat},${loc.lng}`;
      await supabase.from("profiles").upsert(rest,{onConflict:"mobile"});
    }
    router.push(nextUrl);
  };

  return(
    <main className="p-5 space-y-3">
      <h2 className="text-xl font-extrabold text-blue-900">Naya Registration</h2>
      <input className="w-full border-2 border-amber-300 rounded-xl px-3 py-3" placeholder="+91 Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} />
      <input className="w-full border-2 border-amber-300 rounded-xl px-3 py-3" placeholder="Naam - permanent" value={name} onChange={e=>setName(e.target.value)} />
      <textarea className="w-full border-2 border-amber-300 rounded-xl px-3 py-3 h-20" placeholder="Permanent Address - ye fixed rahega profile me" value={permAddress} onChange={e=>setPermAddress(e.target.value)} />
      <div className="bg-gray-50 p-3 rounded-xl border"><p className="text-xs">{locMsg||"GPS lo"}</p>
      <button onClick={getLocation} className="w-full bg-blue-900 text-white py-2 rounded-xl mt-2 text-xs">{loc?"GPS Refresh":"📍 Permanent GPS Lo"}</button></div>
      <button onClick={doLogin} className="gold-btn w-full text-white py-3 rounded-2xl">Register / Login</button>
    </main>
  )
}
export default function Login(){return <Suspense><LoginForm/></Suspense>}
