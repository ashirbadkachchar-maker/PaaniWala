"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/home";
  const [tab, setTab] = useState<"register" | "pin">("pin");

  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [permAddr, setPermAddr] = useState("");
  const [loc, setLoc] = useState<{lat:number,lng:number}|null>(null);
  const [locMsg, setLocMsg] = useState("GPS lo");
  const [regLoading, setRegLoading] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<string|null>(null);
  const [regErr, setRegErr] = useState("");

  const [pinMobile, setPinMobile] = useState("");
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const clean = (m:string)=> m.replace(/\D/g,"").slice(-10);

  const getGPS = ()=>{
    setLocMsg("GPS le raha hoon...");
    navigator.geolocation.getCurrentPosition(p=>{
      setLoc({lat:p.coords.latitude,lng:p.coords.longitude});
      setLocMsg(`Locked: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`);
    },()=>setLocMsg("Location allow karo"),{enableHighAccuracy:true});
  };

  const doRegister = async()=>{
    setRegErr("");
    const c = clean(mobile);
    if(!/^[6-9]\d{9}$/.test(c)) return setRegErr("Sahi mobile dalo");
    if(!name.trim()) return setRegErr("Naam - permanent dalo");
    if(!permAddr.trim()) return setRegErr("Permanent Address dalo");
    if(!loc) return setRegErr("Permanent GPS Lo dabao");
    setRegLoading(true);
    const {data:existing} = await supabase.from("profiles").select("mobile,password").eq("mobile",c).maybeSingle();
    if(existing?.password){
      setRegLoading(false);
      setRegErr("Ye number pehle se registered hai - PIN se Login karo");
      setTab("pin"); setPinMobile(c); return;
    }
    const newPin = String(Math.floor(1000+Math.random()*9000));
    const payload:any={mobile:c,name:name.trim(),address:permAddr.trim(),lat:loc.lat,lng:loc.lng,password:newPin};
    let {error} = await supabase.from("profiles").upsert(payload,{onConflict:"mobile"});
    if(error){
      const {lat,lng,...rest}=payload;
      rest.address=`${permAddr.trim()} | GPS: ${loc.lat},${loc.lng}`;
      await supabase.from("profiles").upsert(rest,{onConflict:"mobile"});
    }
    setGeneratedPin(newPin);
    localStorage.setItem("pw_mobile",c);
    setRegLoading(false);
  };

  const doPinLogin = async()=>{
    setPinErr("");
    const c = clean(pinMobile);
    if(c.length!==10) return setPinErr("Sahi mobile dalo");
    if(!pin) return setPinErr("4-digit PIN dalo");
    setPinLoading(true);
    const {data} = await supabase.from("profiles").select("password").eq("mobile",c).maybeSingle();
    setPinLoading(false);
    if(!data) return setPinErr("Ye number registered nahi hai - Naya Registration karo");
    if(!data.password) return setPinErr("PIN nahi bana - admin se lo");
    if(data.password!==pin.trim()) return setPinErr("Galat PIN");
    localStorage.setItem("pw_mobile",c);
    router.push(nextUrl);
  };

  if(generatedPin){
    return (
      <main className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-[#fffaf0] min-h-screen">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-300 to-amber-600 flex items-center justify-center text-4xl text-white">✓</div>
        <h2 className="text-xl font-extrabold text-blue-900">Registration Ho Gaya!</h2>
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-5 w-full space-y-2">
          <p className="text-sm text-gray-500">Aapka login PIN:</p>
          <p className="text-5xl font-extrabold text-blue-900 tracking-widest">{generatedPin}</p>
          <p className="text-xs text-gray-500">Mobile: +91 {clean(mobile)}</p>
        </div>
        <p className="text-sm font-bold text-red-500">Screenshot le lo!</p>
        <button onClick={()=>router.push(nextUrl)} className="bg-blue-900 w-full text-white py-3 rounded-2xl font-bold">Aage Badho</button>
      </main>
    );
  }

  return (
    <main className="flex-1 p-5 space-y-4 bg-[#fffaf0] min-h-screen">
      <h2 className="text-3xl font-extrabold text-blue-900">Naya Registration</h2>
      <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-2xl p-1">
        <button onClick={()=>setTab("register")} className={"py-2.5 rounded-xl font-bold text-sm "+(tab==="register"?"bg-white text-blue-900 shadow":"text-gray-500")}>Naya Registration</button>
        <button onClick={()=>setTab("pin")} className={"py-2.5 rounded-xl font-bold text-sm "+(tab==="pin"?"bg-white text-blue-900 shadow":"text-gray-500")}>PIN se Login</button>
      </div>
      {tab==="register" ? (
        <>
          <input className="w-full border-2 border-amber-300 rounded-2xl px-4 py-4 bg-white outline-none font-bold" placeholder="+91 Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} inputMode="numeric"/>
          <input className="w-full border-2 border-amber-300 rounded-2xl px-4 py-4 bg-white outline-none" placeholder="Naam - permanent" value={name} onChange={e=>setName(e.target.value)}/>
          <textarea className="w-full border-2 border-amber-300 rounded-2xl px-4 py-4 bg-white outline-none h-28" placeholder="Permanent Address - ye fixed rahega profile me" value={permAddr} onChange={e=>setPermAddr(e.target.value)}/>
          <div className="bg-white border rounded-2xl p-4 space-y-3">
            <p className="font-bold text-sm">{locMsg}</p>
            <button onClick={getGPS} className="w-full bg-blue-900 text-white py-3 rounded-2xl font-bold">📍 Permanent GPS Lo</button>
          </div>
          {regErr && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-xl">{regErr}</p>}
          <button onClick={doRegister} disabled={regLoading} className="w-full bg-gradient-to-r from-amber-300 to-amber-600 text-white py-4 rounded-2xl font-bold text-lg">{regLoading?"Ruko...":"Register / Login"}</button>
        </>
      ) : (
        <>
          <div className="flex justify-center py-2"><span className="text-5xl">🔒</span></div>
          <div className="border-2 border-amber-300 rounded-2xl px-3 py-3 bg-white flex items-center gap-2">
            <span className="font-bold border-r-2 border-amber-300 pr-2">+91</span>
            <input className="flex-1 outline-none font-bold" placeholder="Mobile Number" value={pinMobile} onChange={e=>setPinMobile(e.target.value)} inputMode="numeric"/>
          </div>
          <input className="w-full border-2 border-amber-300 rounded-2xl px-4 py-4 bg-white outline-none font-bold tracking-widest text-center text-xl" type="password" placeholder="4-digit PIN" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric"/>
          {pinErr && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-xl">{pinErr}</p>}
          <button onClick={doPinLogin} disabled={pinLoading} className="w-full bg-blue-900 text-white py-3 rounded-2xl font-bold text-lg">{pinLoading?"Ruko...":"PIN se Login"}</button>
        </>
      )}
    </main>
  );
}
export default function Login(){
  return <Suspense fallback={<p className="p-6 text-center">Loading...</p>}><LoginForm/></Suspense>
}
