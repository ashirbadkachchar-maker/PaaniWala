"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured, getMobile, getBuyerProfile, parseAddress, withGps, mapsUrl, type Gps } from "@/lib/supabase";

const types = ["Ghar", "Office", "Dukaan"];

const GEO_ERRORS: Record<number, string> = {
  1: "Location ki permission nahi mili. Browser settings mein location allow karo.",
  2: "Location pata nahi chal paayi. GPS on karke dobara try karo.",
  3: "Location lene mein zyada samay laga. Dobara try karo.",
};

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
  const [gps, setGps] = useState<Gps | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBuyerProfile().then((p) => {
      if (p?.name) setName(p.name);
      if (p?.address) {
        const parsed = parseAddress(p.address);
        setCurrent(parsed.text);
        setGps(parsed.gps);
      }
    });
  }, []);

  const locate = () => {
    setGpsError("");
    if (!("geolocation" in navigator)) {
      setGpsError("Is device par GPS location support nahi hai.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(Math.round(pos.coords.accuracy));
        setLocating(false);
      },
      (err) => {
        setGpsError(GEO_ERRORS[err.code] || "Location nahi mil paayi.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

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
    const text = [house, area, landmark, city].map((s) => s.trim()).filter(Boolean).join(", ")
      + (pincode ? " - " + pincode : "");
    const address = withGps(text, gps);

    if (!isSupabaseConfigured) {
      console.error("Address save blocked: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not loaded in this environment.");
      setError("Abhi database se connect nahi ho paa raha. Thodi der baad dobara koshish karo.");
      return;
    }

    setSaving(true);
    try {
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({ mobile: getMobile(), name: name.trim(), address }, { onConflict: "mobile" });
      if (dbError) {
        console.error("Address save failed:", dbError);
        setError(`Pata save nahi hua: ${dbError.message}`);
        return;
      }
    } catch (e) {
      console.error("Address save network error:", e);
      setError("Database se connect nahi ho paaya. Internet check karke dobara koshish karo.");
      return;
    } finally {
      setSaving(false);
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

        <section aria-labelledby="gps-heading" className="border-2 border-blue-200 bg-blue-50 rounded-2xl p-3 space-y-2">
          <div>
            <h3 id="gps-heading" className="font-bold text-blue-900">GPS Location</h3>
            <p className="text-xs text-gray-600">
              Location jodne se seller bina phone kiye seedha aapke darwaze tak pahunchega.
            </p>
          </div>

          {gps ? (
            <div className="bg-white rounded-xl p-2 text-sm flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-green-700">Location jud gayi</p>
                <p className="text-xs text-gray-500">
                  {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                  {accuracy !== null && ` (lagbhag ${accuracy} m)`}
                </p>
              </div>
              <a href={mapsUrl(gps)} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-semibold shrink-0">
                Map dekho
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Abhi location nahi judi hai.</p>
          )}

          {gpsError && <p role="alert" className="text-sm text-red-600">{gpsError}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="flex-1 bg-blue-900 text-white font-bold py-2 rounded-xl disabled:opacity-60"
            >
              {locating ? "Location le rahe hain..." : gps ? "Location dobara lo" : "Meri Location Lo"}
            </button>
            {gps && (
              <button type="button" onClick={() => { setGps(null); setAccuracy(null); }} className="px-3 text-sm font-semibold text-red-600">
                Hatao
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">Behtar result ke liye delivery wali jagah par khade hokar location lo.</p>
        </section>

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
