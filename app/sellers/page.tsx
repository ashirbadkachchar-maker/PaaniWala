"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* Doori km me — Haversine formula */
function getKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLa = ((lat2 - lat1) * Math.PI) / 180;
  const dLo = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLa / 2) * Math.sin(dLa / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLo / 2) * Math.sin(dLo / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* Rating stars — SVG, computer par bhi sahi dikhega */
function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating || 0);
  return (
    <span className="inline-flex items-center">
      {[1, 2, 3, 4, 5[STRIPPED 42 bytes]"14" height="14" viewBox="0 0 24 24"
          fill={i <= full ? "#f59e0b" : "#e5e7eb"}>
          <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{Number(rating || 0).toFixed(1)}</span>
    </span>
  );
}

function SellersList() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || ""; // camper | tanker
  const [sellers, setSellers] = useState<any[]>([]);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locMsg, setLocMsg] = useState("Location li ja rahi hai...");

  useEffect(() => {
    supabase
      .from("sellers")
      .select("id,business_name,area,address,lat,lng,camper_rate,tanker_rate,rating")
      .eq("status", "approved")
      .then(({ data, error }) => {
        if (!error && data) setSellers(data);
      });
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocMsg("Browser location support nahi karta");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocMsg("");
      },
      () => setLocMsg("Location allow karo — nazdeeki sellers pehle dikhenge"),
      { timeout: 10000 }
    );
  }, []);

  const sorted = sellers
    .map((s) => ({
      ...s,
      dist: loc && s.lat != null && s.lng != null
        ? getKm(loc.lat, loc.lng, Number(s.lat), Number(s.lng))
        : null,
    }))
    .sort((a, b) => {
      if (a.dist == null && b.dist == null) return 0;
      if (a.dist == null) return 1;
      if (b.dist == null) return -1;
      return a.dist - b.dist;
    });

  const title =
    type === "camper" ? "Camper Sellers"
    : type === "tanker" ? "Tanker Sellers"
    : "Sellers Dekho";

  const rateText = (s: any) => {
    if (type === "camper") return s.camper_rate != null ? `₹${s.camper_rate}/can` : "";
    if (type === "tanker") return s.tanker_rate != null ? `₹${s.tanker_rate}/tanker` : "";
    const parts = [];
    if (s.camper_rate != null) parts.push(`₹${s.camper_rate}/can`);
    if (s.tanker_rate != null) parts.push(`₹${s.tanker_rate}/tanker`);
    return parts.join(" • ");
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-3">
        <h2 className="text-xl font-bold text-blue-900">{title}</h2>
        <p className="text-sm text-gray-500">
          {loc ? "Nazdeek se door tak — doori ke hisaab se" : locMsg}
        </p>
        <div className="space-y-3">
          {sorted.map((s) => (
            <div key={s.id} className="gold-card rounded-2xl p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-extrabold text-blue-900 text-lg">{s.business_name}</p>
                  <p className="text-sm text-gray-500">
                    {s.area || ""}{s.address ? " - " + s.address : ""}
                  </p>
                </div>
                {s.dist != null && (
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                    {s.dist < 1 ? `${Math.round(s.dist * 1000)} m` : `${s.dist.toFixed(1)} km`}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center mt-2">
                <Stars rating={Number(s.rating) || 0} />
                <span className="text-sm font-extrabold text-blue-900">{rateText(s)}</span>
              </div>
              <Link
                href={"/shop/" + s.id + (type ? "?type=" + type : "")}
                className="gold-btn block text-center text-white font-bold py-2.5 rounded-2xl mt-3"
              >
                Dukkan Kholo
              </Link>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="text-gray-400 text-sm text-center">Abhi koi seller nahi hai...</p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

export default function Sellers() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-gray-400">Loading...</p>}>
      <SellersList />
    </Suspense>
  );
}
