"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SellerRegister() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locMsg, setLocMsg] = useState("");
  const [camperRate, setCamperRate] = useState("40");
  const [tankerRate, setTankerRate] = useState("1200");
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const takeLocation = () => {
    setLocMsg("Location li ja rahi hai...");
    if (!("geolocation" in navigator)) {
      setLocMsg("Browser location support nahi karta");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(p.coords.latitude);
        setLng(p.coords.longitude);
        setLocMsg("Location mil gayi ✓");
      },
      () => setLocMsg("Location allow karo - buyers ko nazdeeki dukkan dikhegi"),
      { timeout: 10000 }
    );
  };

  const submit = async () => {
    setErr("");
    if (!businessName.trim()) { setErr("Business ka naam dalo"); return; }
    if (!ownerName.trim()) { setErr("Apna naam dalo"); return; }
    const clean = mobile.replace(/\D/g, "");
    if (clean.length < 10) { setErr("Sahi mobile number dalo"); return; }
    if (password.length < 4) { setErr("Password kam se kam 4 digit ka rakho"); return; }
    if (lat == null || lng == null) { setErr("Pehle Current Location lo"); return; }
    if (!agreed) { setErr("Pehle Seller Agreement par tick karo"); return; }
    setSaving(true);
    const { error } = await supabase.from("sellers").insert({
      business_name: businessName.trim(),
      owner_name: ownerName.trim(),
      mobile: clean,
      password: password,
      area: area.trim(),
      address: address.trim(),
      lat: lat,
      lng: lng,
      camper_rate: parseInt(camperRate) || 40,
      tanker_rate: parseInt(tankerRate) || 1200,
      rating: 4.0,
      commission_rate: 5,
      status: "pending",
    });
    setSaving(false);
    if (error) {
      setErr("Error: " + error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <>
        <Header />
        <main className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full gold-btn flex items-center justify-center text-4xl text-white">✓</div>
          <h2 className="text-xl font-extrabold text-blue-900">Request Bhej Di!</h2>
          <p className="text-sm text-gray-500">
            Admin approval ke baad hi aapki dukkan buyers ko dikhegi.<br />
            Approval milte hi login karke apne products add karo.
          </p>
          <button onClick={() => router.push("/home")} className="gold-btn text-white font-bold px-8 py-3 rounded-2xl">
            Home Jao
          </button>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href="/home" className="text-blue-600 font-semibold text-sm">← Home</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Seller Register Karo</h2>

        <div>
          <label className="font-semibold text-blue-900 text-sm">Business ka Naam *</label>
          <input className="input-gold mt-1" placeholder="Sharma Water Supply"
            value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </div>
        <div>
          <label className="font-semibold text-blue-900 text-sm">Aapka Naam *</label>
          <input className="input-gold mt-1" placeholder="Ramesh Sharma"
            value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
        </div>
        <div>
          <label className="font-semibold text-blue-900 text-sm">Mobile Number *</label>
          <div className="input-gold flex items-center gap-2 mt-1">
            <span className="font-bold text-blue-900 border-r-2 border-amber-300 pr-2">+91</span>
            <input className="flex-1 outline-none font-bold text-blue-900" placeholder="98765 43210"
              value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="numeric" />
          </div>
        </div>
        <div>
          <label className="font-semibold text-blue-900 text-sm">Password (kam se kam 4 digit) *</label>
          <input className="input-gold mt-1" type="password" placeholder="Apna password rakho"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-blue-900 text-sm">Area</label>
            <input className="input-gold mt-1" placeholder="Sardarpura"
              value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div>
            <label className="font-semibold text-blue-900 text-sm">Address</label>
            <input className="input-gold mt-1" placeholder="Shop no, gali"
              value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>

        <div>
          <button onClick={takeLocation} className="w-full bg-blue-50 border-2 border-blue-200 rounded-2xl py-3 font-bold text-blue-900">
            📍 Current Location Lo *
          </button>
          {locMsg && <p className="text-center text-sm font-semibold text-green-600 mt-1">{locMsg}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-blue-900 text-sm">Camper Rate (Rs/can)</label>
            <input className="input-gold mt-1" value={camperRate}
              onChange={(e) => setCamperRate(e.target.value)} inputMode="numeric" />
          </div>
          <div>
            <label className="font-semibold text-blue-900 text-sm">Tanker Rate (Rs/tanker)</label>
            <input className="input-gold mt-1" value={tankerRate}
              onChange={(e) => setTankerRate(e.target.value)} inputMode="numeric" />
          </div>
        </div>

        <div className="border-2 border-amber-300 bg-amber-50 rounded-2xl p-4 space-y-2">
          <p className="font-extrabold text-blue-900">Seller Agreement</p>
          <div className="text-xs text-gray-600 space-y-1.5 max-h-44 overflow-y-auto pr-1">
            <p>1. Main PaaniWala platform par apne paani products (bottle, camper, tanker) bechne ke liye register kar raha/rahi hun.</p>
            <p>2. Har order par <b>platform commission</b> katega. Commission ki dar <b>Admin decide karega</b> (filhal 5% hai).</p>
            <p>3. Admin ye commission <b>kabhi bhi badal sakta hai</b> (kam ya zyada). Main Admin dwara decide kiye gaye commission se <b>puri tarah sehmat</b> hun, chahe wo aage badle.</p>
            <p>4. Commission order amount se katkar <b>baki rakam</b> mujhe milegi.</p>
            <p>5. Meri dukkan aur mere products buyers ko <b>sirf Admin approval ke baad</b> hi dikhenge.</p>
            <p>6. Galat rate, nakli product ya kharab service par Admin mera account <b>band</b> kar sakta hai.</p>
          </div>
          <label className="flex items-start gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 accent-amber-500 shrink-0" />
            <span className="text-sm font-bold text-blue-900">
              Maine Seller Agreement padh liya hai aur Admin ke decide kiye gaye commission (jo aage badal bhi sakta hai) se sehmat hun
            </span>
          </label>
        </div>

        {err && <p className="text-red-500 text-sm font-semibold text-center">{err}</p>}

        <button onClick={submit} disabled={saving || !agreed}
          className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-40">
          {saving ? "Ruko..." : "Sehmat Hun - Register Karo"}
        </button>
        {!agreed && (
          <p className="text-center text-xs text-gray-400">Register karne ke liye upar Agreement par tick zaroori hai</p>
        )}
      </main>
      <BottomNav />
    </>
  );
}
