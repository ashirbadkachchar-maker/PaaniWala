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

export function makeOrderId() {
  return "PW-" + Math.floor(1000 + Math.random() * 9000);
}
