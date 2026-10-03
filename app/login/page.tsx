"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/home";

  const [tab, setTab] = useState<"register" | "login">("register");
  
  // GPS
  const [location, setLocation] = useState<{lat:number,lng:number,accuracy:number}|null>(null);
  const [gpsState, setGpsState] = useState<"idle"|"fetching"|"success"|"error">("idle");
  const [gpsMsg, setGpsMsg] = useState("GPS lo");

  // Register form - seller jaisa hi
  const [regForm, setRegForm] = useState({
    name: "", mobile: "", password: "",
    area: "", address: "", permanent_address: ""
  });

  // Login form
  const [loginForm, setLoginForm] = useState({ mobile: "", password: "" });
  
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successPin, setSuccessPin] = useState<string|null>(null);

  const clean = (m:string)=> m.replace(/\D/g,"").slice(-10);

  const getGPS = () => {
    setGpsState("fetching");
    setGpsMsg("GPS le raha hoon...");
    navigator.geolocation.getCurrentPosition(
      (p)=>{
        setLocation({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy});
        setGpsState("success");
        setGpsMsg(`Locked: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`);
      },
      ()=>{
        setGpsState("error");
        setGpsMsg("Location allow karo");
      },
      {enableHighAccuracy:true, timeout:15000}
    );
  };

  // REGISTRATION - Seller wala logic
  const doRegister = async () => {
    setErr("");
    const c = clean(regForm.mobile);
    if(!/^[6-9]\d{9}$/.test(c)) return setErr("Sahi mobile dalo *");
    if(!regForm.name.trim()) return setErr("Aapka Naam dalo *");
    if(regForm.password.length < 4) return setErr("Password kam se kam 4 digit *");
    if(!regForm.area.trim()) return setErr("Area dalo *");
    if(!regForm.address.trim()) return setErr("Ghar ka pata dalo *");
    if(!regForm.permanent_address.trim()) return setErr("Permanent Address dalo *");
    if(!location) return setErr("Current Location Lo dabana zaruri hai *");

    setLoading(true);
    const { data: existing } = await supabase.from("profiles").select("mobile").eq("mobile",c).maybeSingle();
    if(existing){
      setLoading(false);
      setErr("Ye number pehle se hai - Login karo");
      setTab("login");
      setLoginForm({mobile:c, password:""});
      return;
    }

    const payload:any = {
      mobile: c,
      name: regForm.name.trim(),
      password: regForm.password.trim(),
      area: regForm.area.trim(),
      address: regForm.address.trim(),
      permanent_address: regForm.permanent_address.trim(),
      lat: location.lat,
      lng: location.lng,
      current_address_gps: `https://www.google.com/maps?q=${location.lat},${location.lng}`,
      role: "buyer"
    };

    let { error } = await supabase.from("profiles").insert([payload]);
    if(error){
      // fallback agar lat/lng column na ho
      const fallback:any = {
        mobile: c,
        name: regForm.name.trim(),
        password: regForm.password.trim(),
        address: `${regForm.permanent_address} | ${regForm.address} | GPS:${location.lat},${location.lng}`,
        role: "buyer"
      };
      const { error: e2 } = await supabase.from("profiles").insert([fallback]);
      if(e2){ setErr(e2.message); setLoading(false); return; }
    }

    setSuccessPin(regForm.password);
    localStorage.setItem("pw_mobile", c);
    localStorage.setItem("pw_buyer_name", regForm.name.trim());
    setLoading(false);
  };

  // LOGIN - Agli baar yahi se hoga
  const doLogin = async () => {
    setErr("");
    const c = clean(loginForm.mobile);
    if(c.length!==10) return setErr("Sahi mobile dalo");
    if(!loginForm.password) return setErr("Password dalo");
    setLoading(true);
    const { data } = await supabase.from("profiles").select("mobile,password,name").eq("mobile",c).maybeSingle();
    setLoading(false);
    if(!data) return setErr("Ye number registered nahi hai - Naya Registration karo");
    if(data.password !== loginForm.password.trim()) return setErr("Galat password");
    localStorage.setItem("pw_mobile", c);
    localStorage.setItem("pw_buyer_name", data.name || "");
    router.push(nextUrl);
  };

  if(successPin){
    return (
      <main className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-[#fefbf0] min-h-screen">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-300 to-amber-600 flex items-center justify-center text-4xl text-white">✓</div>
        <h2 className="text-xl font-extrabold text-blue-900">Registration Ho Gaya!</h2>
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-5 w-full space-y-2">
          <p className="text-sm text-gray-500">Aapka login password:</p>
          <p className="text-4xl font-extrabold text-blue-900 tracking-widest">{successPin}</p>
          <p className="text-xs text-gray-500">Mobile: +91 {clean(regForm.mobile)}</p>
        </div>
        <p className="text-sm font-bold text-red-500">Yaad rakho - agli baar isi se login hoga!</p>
        <button onClick={()=>router.push(nextUrl)} className="bg-blue-900 w-full text-white py-3 rounded-2xl font-bold">Aage Badho - Home</button>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 space-y-4 bg-[#fefbf0] min-h-screen max-w-md mx-auto">
      <h2 className="text-3xl font-extrabold text-blue-900">Buyer Login</h2>
      
      <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-2xl p-1">
        <button onClick={()=>setTab("register")} className={`py-2.5 rounded-xl font-bold text-sm ${tab==="register"?"bg-white text-blue-900 shadow":"text-gray-500"}`}>Naya Registration</button>
        <button onClick={()=>setTab("login")} className={`py-2.5 rounded-xl font-bold text-sm ${tab==="login"?"bg-white text-blue-900 shadow":"text-gray-500"}`}>Login</button>
      </div>

      {tab==="register" ? (
        <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 space-y-3">
          <label className="text-xs font-bold text-blue-900">Aapka Naam *</label>
          <input value={regForm.name} onChange={e=>setRegForm({...regForm,name:e.target.value})} placeholder="Mahesh Chand" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none" />
          
          <label className="text-xs font-bold text-blue-900">Mobile Number *</label>
          <div className="flex items-center gap-2 border-2 border-amber-300 rounded-2xl px-3 py-3.5">
            <span className="font-bold border-r-2 pr-2">+91</span>
            <input value={regForm.mobile} onChange={e=>setRegForm({...regForm,mobile:e.target.value})} placeholder="98765 43210" inputMode="numeric" className="flex-1 outline-none font-bold" />
          </div>

          <label className="text-xs font-bold text-blue-900">Password kam se kam 4 digit *</label>
          <input value={regForm.password} onChange={e=>setRegForm({...regForm,password:e.target.value.replace(/\D/g,"").slice(0,6)})} placeholder="••••" type="password" inputMode="numeric" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none tracking-widest text-center font-bold" />

          <label className="text-xs font-bold text-blue-900">Area *</label>
          <input value={regForm.area} onChange={e=>setRegForm({...regForm,area:e.target.value})} placeholder="Sardarpura, Jodhpur" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none" />

          <label className="text-xs font-bold text-blue-900">Ghar ka pata *</label>
          <input value={regForm.address} onChange={e=>setRegForm({...regForm,address:e.target.value})} placeholder="House no, Gali" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none" />

          <label className="text-xs font-bold text-blue-900">Permanent Address - ye fixed rahega *</label>
          <textarea value={regForm.permanent_address} onChange={e=>setRegForm({...regForm,permanent_address:e.target.value})} placeholder="Pura address likho..." className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none h-24" />

          <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-3 space-y-2">
            <p className="text-xs font-bold text-blue-900">Current Location *</p>
            <p className={`text-xs font-bold ${gpsState==="success"?"text-green-700":"text-gray-500"}`}>{gpsMsg}</p>
            <button onClick={getGPS} type="button" className={`w-full py-3 rounded-2xl font-bold ${gpsState==="success"?"bg-green-600 text-white":"bg-blue-900 text-white"}`}>
              {gpsState==="idle" && "📍 Current Location Lo *"}
              {gpsState==="fetching" && "📡 Location Li Ja Rahi Hai..."}
              {gpsState==="success" && "✅ Location Mil Gayi ✓"}
              {gpsState==="error" && "❌ Phir se GPS Lo"}
            </button>
          </div>

          {err && <p className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-xl text-center">{err}</p>}
          <button onClick={doRegister} disabled={loading} className="w-full bg-gradient-to-r from-amber-300 to-amber-600 text-white py-4 rounded-2xl font-extrabold text-lg">{loading?"Ruko...":"Register Karo"}</button>
        </div>
      ) : (
        <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 space-y-3">
          <div className="flex justify-center py-2"><span className="text-5xl">🔒</span></div>
          <div className="border-2 border-amber-300 rounded-2xl px-3 py-3.5 bg-white flex items-center gap-2">
            <span className="font-bold border-r-2 border-amber-300 pr-2">+91</span>
            <input value={loginForm.mobile} onChange={e=>setLoginForm({...loginForm,mobile:e.target.value})} placeholder="Mobile Number" inputMode="numeric" className="flex-1 outline-none font-bold" />
          </div>
          <input value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} type="password" placeholder="Aapka Password" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none font-bold tracking-widest text-center" />
          {err && <p className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-xl text-center">{err}</p>}
          <button onClick={doLogin} disabled={loading} className="w-full bg-blue-900 text-white py-3.5 rounded-2xl font-bold text-lg">{loading?"Ruko...":"Login Karo"}</button>
          <p className="text-xs text-center text-gray-400">Pehli baar? Naya Registration tab pe jao</p>
        </div>
      )}
    </main>
  );
}

export default function Login(){
  return <Suspense fallback={<p className="p-6 text-center">Loading...</p>}><LoginForm/></Suspense>
}
