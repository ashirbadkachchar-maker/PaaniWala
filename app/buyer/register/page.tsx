"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function RegisterForm(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/home";
  const [name,setName]=useState(""); const [mobile,setMobile]=useState("");
  const [address,setAddress]=useState(""); const [area,setArea]=useState("");
  const [pin,setPin]=useState(""); const [confirmPin,setConfirmPin]=useState("");
  const [loc,setLoc]=useState<{lat:number,lng:number}|null>(null);
  const [locMsg,setLocMsg]=useState("GPS Location lo - seller ko sahi jagah milegi");
  const [locLoading,setLocLoading]=useState(false);
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);

  const getLocation=()=>{
    setLocLoading(true); setLocMsg("Location li ja rahi hai...");
    navigator.geolocation.getCurrentPosition(p=>{
      setLoc({lat:p.coords.latitude,lng:p.coords.longitude});
      setLocMsg(`GPS mil gaya! ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`);
      setLocLoading(false);
    },()=>{setLocMsg("Location allow karo"); setLocLoading(false);},{enableHighAccuracy:true,timeout:15000});
  };

  const doRegister=async()=>{
    const cleanMobile=mobile.replace(/\D/g,"").slice(-10);
    const cleanPin=pin.replace(/\D/g,"").slice(0,6);
    if(!name.trim()){setErr("Naam dalo"); return;}
    if(cleanMobile.length<10){setErr("Sahi mobile dalo"); return;}
    if(!address.trim()){setErr("Pura address dalo"); return;}
    if(cleanPin.length<4){setErr("4-digit PIN banao"); return;}
    if(cleanPin!==confirmPin.replace(/\D/g,"").slice(0,6)){setErr("PIN confirm nahi hua"); return;}
    if(!loc){setErr("Pehle GPS Location lo"); return;}

    setLoading(true);
    const {data:exists}=await supabase.from("profiles").select("id").eq("mobile",cleanMobile).maybeSingle();
    if(exists){setErr("Ye mobile pehle se registered hai! Login karo"); setLoading(false); return;}

    const payload:any={mobile:cleanMobile,password:cleanPin,name:name.trim(),address:address.trim()+(area?`, ${area}`:""),lat:loc.lat,lng:loc.lng, permanent_address:address.trim(), area:area.trim(), current_address_gps:`https://www.google.com/maps?q=${loc.lat},${loc.lng}`, role:"buyer"};

    let {error}=await supabase.from("profiles").insert(payload);
    if(error && error.message.includes("column")){
      const {lat,lng,...rest}=payload; rest.address=`${payload.address} | GPS: ${loc.lat},${loc.lng}`;
      const {error:error2}=await supabase.from("profiles").insert(rest); error=error2;
    }
    if(error){setErr(error.message); setLoading(false); return;}
    localStorage.setItem("pw_mobile",cleanMobile);
    localStorage.setItem("pw_buyer_name",name.trim());
    setLoading(false);
    router.push(nextUrl);
  };

  return(
    <div className="min-h-screen bg-[#fffaf0]">
      {/* HEADER - Seller jaisa */}
      <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-amber-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💧</span>
          <span className="text-[22px] font-extrabold text-[#1e3a8a]">PaaniWala</span>
        </div>
        <Link href="/login" className="bg-gradient-to-r from-[#f6c33a] to-[#d98e28] text-white font-bold px-5 py-2 rounded-full text-sm">Login</Link>
      </header>

      <main className="p-5 space-y-4 max-w-md mx-auto">
        <Link href="/login" className="text-[#2b5bd7] font-bold text-[15px]">← Login</Link>
        <h2 className="text-[24px] font-extrabold text-[#1e3a8a]">Naya Buyer Register</h2>

        <div className="space-y-3 pt-1">
          <div>
            <label className="font-bold text-[#1e3a8a] text-[14px]">Aapka Naam *</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ramesh Sharma" className="mt-1 w-full border-2 border-[#e8a531] rounded-2xl px-4 py-3.5 font-bold bg-white outline-none placeholder:text-gray-400" />
          </div>

          <div>
            <label className="font-bold text-[#1e3a8a] text-[14px]">Mobile Number *</label>
            <div className="mt-1 flex items-center gap-3 border-2 border-[#e8a531] rounded-2xl px-4 py-3.5 bg-white">
              <span className="font-extrabold text-[#1e3a8a] border-r-2 border-[#f6c33a] pr-3">+91</span>
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="98765 43210" className="flex-1 outline-none font-bold placeholder:text-gray-400" inputMode="numeric" />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1e3a8a] text-[14px]">Pura Address *</label>
            <textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="Ghar no, Gali, Mohalla *" className="mt-1 w-full border-2 border-[#e8a531] rounded-2xl px-4 py-3.5 font-bold bg-white h-20 outline-none placeholder:text-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1e3a8a] text-[14px]">Area</label>
              <input value={area} onChange={e=>setArea(e.target.value)} placeholder="Sardarpura" className="mt-1 w-full border-2 border-[#e8a531] rounded-2xl px-4 py-3.5 font-bold bg-white outline-none placeholder:text-gray-400" />
            </div>
            <div className="rounded-2xl p-3 border-2 border-[#d0e2ff] bg-[#eef5ff]">
              <p className="font-extrabold text-[12px] text-[#1e3a8a]">📍 GPS Location *</p>
              <p className="text-[10px] text-gray-600 mt-1 leading-tight">{locMsg}</p>
              <button onClick={getLocation} disabled={locLoading} className="mt-2 w-full bg-[#1e3a8a] text-white font-bold py-2 rounded-xl text-xs">
                {locLoading?"Le raha hoon...":loc?"✓ GPS Mil Gaya":"📍 Meri Location Lo"}
              </button>
              {loc && <a href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} target="_blank" className="block text-center text-[11px] text-blue-600 font-bold mt-1">Map pe dekho</a>}
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1e3a8a] text-[14px]">4-Digit PIN Banao *</label>
            <input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,6))} type="password" placeholder="Apna PIN rakho" className="mt-1 w-full border-2 border-[#e8a531] rounded-2xl px-4 py-3.5 font-bold bg-white outline-none placeholder:text-gray-400 text-center tracking-widest" inputMode="numeric" />
          </div>
          <div>
            <label className="font-bold text-[#1e3a8a] text-[14px]">PIN Confirm *</label>
            <input value={confirmPin} onChange={e=>setConfirmPin(e.target.value.replace(/\D/g,"").slice(0,6))} type="password" placeholder="PIN Confirm karo" className="mt-1 w-full border-2 border-[#e8a531] rounded-2xl px-4 py-3.5 font-bold bg-white outline-none placeholder:text-gray-400 text-center tracking-widest" inputMode="numeric" />
          </div>

          {err && <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl py-2.5 text-center text-sm font-bold">{err}</p>}

          <button onClick={doRegister} disabled={loading} className="w-full py-4 rounded-2xl text-white font-extrabold text-[17px] bg-gradient-to-r from-[#f6c33a] to-[#d98e28] shadow">
            {loading?"Register ho raha...":"Register Karo - GPS ke Saath"}
          </button>
          <p className="text-center text-gray-500 text-xs">Already account? <Link href="/login" className="text-[#2b5bd7] font-bold">Login Karo</Link></p>
        </div>
      </main>
    </div>
  )
}
export default function Register(){ return <Suspense fallback={<p className="p-6 text-center">Loading...</p>}><RegisterForm/></Suspense> }
