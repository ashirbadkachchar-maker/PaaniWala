"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { supabase, getMobile, getBuyerProfile } from "@/lib/supabase";

const types = ["Ghar", "Office", "Dukaan"];

export default function Address() {
  const router = useRouter();
  const [type, setType] = useState(types[0]);
  const [name, setName] = useState("");
  const [house, setHouse] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Jodhpur");
  const [pincode, setPincode] = useState("");
  const [current, setCurrent] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBuyerProfile().then((p) => {
      if (p?.name) setName(p.name);
      if (p?.address) setCurrent(p.address);
    });
  }, []);

  const save = async () => {
    setError("");
    if (!name.trim() || !house.trim() || !area.trim() || !city.trim()) {
      setError("Naam, Flat/House No, Area aur Shahar bharna zaroori hai.");
      return;
    }
    if (pincode && !/^\d{6}$/.test(pincode)) {
      setError("Pincode 6 ank ka hona chahiye.");
      return;
    }
    const address = [house, area, landmark, city].map((s) => s.trim()).filter(Boolean).join(", ")
      + (pincode ? " - " + pincode : "");

    setSaving(true);
    const { error: dbError } = await supabase
      .from("profiles")
      .upsert({ mobile: getMobile(), name: name.trim(), address }, { onConflict: "mobile" });
    setSaving(false);
    if (dbError) {
      setError("Pata save nahi hua, dobara koshish karo.");
      return;
    }
    if (window.history.length > 1) router.back();
    else router.push("/sellers");
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-3">
        <h2 className="text-xl font-bold text-blue-900">Delivery Pata</h2>

        {current && (
          <div className="gold-card rounded-2xl p-3 text-sm">
            <p className="text-gray-500">Abhi ka pata</p>
            <p className="font-semibold text-blue-900">{current}</p>
          </div>
        )}

        <p className="text-sm text-gray-500">
          Area / Mohalla sahi bharo - isi se aapke paas ke sellers dikhenge.
        </p>

        <div className="space-y-2">
          <div>
            <label htmlFor="name" className="text-sm font-semibold text-blue-900">Naam</label>
            <input id="name" className="input-gold mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="house" className="text-sm font-semibold text-blue-900">Flat / House No</label>
            <input id="house" className="input-gold mt-1" value={house} onChange={(e) => setHouse(e.target.value)} placeholder="B-2-304" />
          </div>
          <div>
            <label htmlFor="area" className="text-sm font-semibold text-blue-900">Area / Mohalla</label>
            <input id="area" className="input-gold mt-1" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Arihant Anchal" />
          </div>
          <div>
            <label htmlFor="landmark" className="text-sm font-semibold text-blue-900">Landmark (optional)</label>
            <input id="landmark" className="input-gold mt-1" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="city" className="text-sm font-semibold text-blue-900">Shahar</label>
              <input id="city" className="input-gold mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="flex-1">
              <label htmlFor="pincode" className="text-sm font-semibold text-blue-900">Pincode</label>
              <input id="pincode" className="input-gold mt-1" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-900 mb-2">Address type</p>
          <div className="flex gap-2">
            {types.map((t) => (
              <button key={t} onClick={() => setType(t)} className={`chip ${type === t ? "chip-on" : "chip-off"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button onClick={save} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-60">
          {saving ? "Save ho raha hai..." : "Save Karo"}
        </button>
      </main>
      <BottomNav />
    </>
  );
}
