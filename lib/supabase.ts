import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Database calls will fail until they are set."
  );
}

// createClient throws on an empty URL, which crashed every page that imports this module.
export const supabase = createClient(
  url || "https://missing-supabase-url.invalid",
  key || "missing-supabase-anon-key"
);

// demo mobile jab tak asli login na ho
export function getMobile() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pw_mobile") || "9876543210";
  }
  return "9876543210";
}

export type BuyerProfile = { name: string | null; mobile: string; address: string | null };

export async function getBuyerProfile(): Promise<BuyerProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("name,mobile,address")
    .eq("mobile", getMobile())
    .maybeSingle();
  return data;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, " ").trim();

export function areaMatches(buyerAddress: string | null | undefined, sellerArea: string | null | undefined) {
  if (!buyerAddress || !sellerArea) return false;
  const area = normalize(sellerArea);
  return area.length > 0 && (" " + normalize(buyerAddress) + " ").includes(" " + area + " ");
}

export type Gps = { lat: number; lng: number };

// GPS is stored inside the address text so no schema change is needed.
const GPS_MARKER = " | GPS: ";

export function withGps(text: string, gps: Gps | null) {
  return gps ? `${text}${GPS_MARKER}${gps.lat.toFixed(6)},${gps.lng.toFixed(6)}` : text;
}

export function parseAddress(address: string | null | undefined): { text: string; gps: Gps | null } {
  if (!address) return { text: "", gps: null };
  const i = address.lastIndexOf(GPS_MARKER);
  if (i === -1) return { text: address, gps: null };
  const [lat, lng] = address.slice(i + GPS_MARKER.length).split(",").map(Number);
  const gps = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  return { text: address.slice(0, i), gps };
}

export function mapsUrl(gps: Gps) {
  return `https://www.google.com/maps/dir/?api=1&destination=${gps.lat},${gps.lng}`;
}

export function makeOrderId() {
  return "PW-" + Math.floor(1000 + Math.random() * 9000);
}
