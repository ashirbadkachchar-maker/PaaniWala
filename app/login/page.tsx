"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BuyerRegisterPage() {
  const router = useRouter();
  const [location, setLocation] = useState<{lat:number,lng:number,accuracy:number} | null>(null);
  const [gpsState, setGpsState] = useState<"idle"|"fetching"|"success"|"error">("idle");
  const [gpsMsg, setGpsMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "", mobile: "", password: "",
    area: "", address: "", permanent_address: ""
  });

  const getCurrentLocation = () => {
    setGpsState("fetching");
    setGpsMsg("Location li ja rahi hai...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setGpsState("success");
        setGpsMsg(`Locked ✓ ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} | ${Math.round(pos.coords.accuracy)}m`);
      },
      () => {
        setGpsState("error");
        setGpsMsg("Location permission allow karo");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleRegister = async () => {
    setErr("");
    const cleanMob = form.mobile.replace(/\D/g,"").slice(-10);
    if(!form.name.trim()) return setErr("Aapka Naam dalo *");
    if(!/^[6-9]\d{9}$/.test(cleanMob)) return setErr("Sahi mobile dalo *");
    if(form.password.length < 4) return setErr("Password 4 digit se kam hai *");
    if(!form.area.trim()) return setErr("Area dalo *");
    if(!form.address.trim()) return setErr("Ghar ka pata dalo *");
    if(!form.permanent_address.trim()) return setErr("Permanent Address dalo *");
    if(!location) return setErr("Current Location Lo dabana zaruri hai *");

    setLoading(true);
    try {
      const { data: exist } = await supabase.from("profiles").select("mobile").eq("mobile", cleanMob).maybeSingle();
      if(exist) throw new Error("Ye number pehle se registered hai");

      const payload = {
        mobile: cleanMob,
        name: form.name.trim(),
        password: form.password,
        area: form.area.trim(),
        address: form.address.trim(),
        permanent_address: form.permanent_address.trim(),
        lat: location.lat,
        lng: location.lng,
        current_address_gps: `https://www.google.com/maps?q=${location.lat},${location.lng}`,
        role: "buyer"
      };

      let { error } = await supabase.from("profiles").insert([payload]);
      if(error){
        // Fallback - agar lat/lng column nahi bana to
        const fallback:any = {
          mobile: cleanMob,
          name: form.name.trim(),
          password: form.password,
          address: `${form.permanent_address} | ${form.address} | GPS: ${location.lat},${location.lng}`,
          role: "buyer"
        };
        const { error: e2 } = await supabase.from("profiles").insert([fallback]);
        if(e2) throw e2;
      }

      localStorage.setItem("pw_mobile", cleanMob);
      localStorage.setItem("pw_buyer_name", form.name.trim());
      router.push("/home");
    } catch(e:any){
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fefbf0] min-h-screen p-4">
      <main className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-extrabold text-blue-900">Buyer Registration</h1>

        <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 space-y-3">
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Aapka Naam *" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none" />

          <div className="flex items-center gap-2 border-2 border-amber-300 rounded-2xl px-3 py-3.5">
            <span className="font-bold border-r-2 pr-2">+91</span>
            <input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="Mobile *" inputMode="numeric" className="flex-1 outline-none font-bold" />
          </div>

          <input value={form.password} onChange={e=>setForm({...form,password:e.target.value.replace(/\D/g,"")})} placeholder="Password (4 digit) *" type="password" maxLength={6} inputMode="numeric" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none tracking-widest text-center font-bold" />
          <input value={form.area} onChange={e=>setForm({...form,area:e.target.value})} placeholder="Area * (Sardarpura)" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none" />
          <input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Ghar ka pata *" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none" />
          <textarea value={form.permanent_address} onChange={e=>setForm({...form,permanent_address:e.target.value})} placeholder="Permanent Address - ye fixed rahega *" className="w-full border-2 border-amber-300 rounded-2xl px-4 py-3.5 outline-none h-24" />

          <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-3 space-y-2">
            <p className="text-xs font-bold">{gpsMsg || "GPS lo - seller ko exact location jayega"}</p>
            {location && <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" className="text-xs text-blue-600 font-bold underline">📍 Map pe dekho - {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</a>}
            <button onClick={getCurrentLocation} disabled={gpsState==="fetching"} className={`w-full py-3.5 rounded-2xl font-bold ${gpsState==="success"?"bg-green-600 text-white":"bg-blue-900 text-white"}`}>
              {gpsState==="idle" && "📍 Current Location Lo *"}
              {gpsState==="fetching" && "Location Li Ja Rahi Hai..."}
              {gpsState==="success" && "✅ Location Mil Gayi ✓"}
              {gpsState==="error" && "❌ Phir se GPS Lo"}
            </button>
          </div>

          {err && <p className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl text-center">{err}</p>}
          <button onClick={handleRegister} disabled={loading} className="w-full bg-gradient-to-r from-amber-300 to-amber-600 text-white py-4 rounded-2xl font-extrabold text-lg">
            {loading?"Ruko...":"Register Karo"}
          </button>
        </div>
      </main>
    </div>
  );
}
