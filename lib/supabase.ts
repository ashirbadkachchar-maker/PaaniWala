import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

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

export function makeOrderId() {
  return "PW-" + Math.floor(1000 + Math.random() * 9000);
}
