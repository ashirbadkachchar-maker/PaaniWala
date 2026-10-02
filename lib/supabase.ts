import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// FIXED: No default mobile, no auto-login
export const getMobile = (): string | null => {
  if (typeof window === "undefined") return null;
  const m = localStorage.getItem("pw_mobile");
  if (!m || m === "9876543210") return null; // block demo number
  return m;
};

export const setMobile = (mobile: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("pw_mobile", mobile.replace(/\D/g, "").slice(-10));
};

export const clearMobile = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pw_mobile");
};

export const makeOrderId = (): string => {
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const time = Date.now().toString().slice(-5);
  return `PW${time}${rand}`;
};
