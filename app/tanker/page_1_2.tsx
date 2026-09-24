"use client";
import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, getMobile, makeOrderId } from "@/lib/supabase";

const sizes = [
  { label: "2000L - Rs 1200", price: 1200 },
  { label: "5000L - Rs 2500", price: 2500 },
  { label: "10000L - Rs 4500", price: 4500 },
];
const dates = ["Aaj", "Kal", "Parson"];
const times = ["Subah 8 Baje", "Dopahar 12 Baje", "Shaam 5 Baje"];

export default function Tanker() {
  const router = useRouter();
  const [size, setSize] = useState(sizes[1]);
  const [date, setDate] = useState(dates[1]);
  const [time, setTime] = useState(times[0]);
  const [saving, setSaving] = useState(false);
  const disc = Math.round(size.price * 0.2);

  const placeOrder = async () => {
    setSaving(true);
    const orderId = makeOrderId();
    await supabase.from("orders").insert({
      order_id: orderId,
      mobile: getMobile(),
      item_type: "tanker",
      item_name: size.label.split(" - ")[0] + " Tanker",
      qty: 1,
      price: size.price,
      discount: disc,
      total: size.price - disc,
      delivery_slot: date + " " + time,
      address: "B-2-304, Arihant Anchal, Jodhpur",
      status: "Raste Me Hai",
    });
    localStorage.setItem("pw_last_order", orderId);
    setSaving(false);
    router.push("/success");
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">← Tanker Book Karo</h2>

        <div className="gold-card rounded-2xl p-4 text-center">
          <div className="text-6xl">🚛</div>
          <p className="font-bold text-blue-900 mt-2">Shuddh Paani Tanker</p>
          <p className="text-gray-500 text-sm">Rs 1200 se</p>
        </div>

        <div>
          <p className="font-semibold text-blue-900 mb-2">Tanker Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button key={s.label} onClick={() => setSize(s)} className={`chip ${size.label === s.label ? "chip-on" : "chip-off"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-blue-900 mb-2">Delivery Date</p>
          <div className="flex flex-wrap gap-2">
            {dates.map((d) => (
              <button key={d} onClick={() => setDate(d)} className={`chip ${date === d ? "chip-on" : "chip-off"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-blue-900 mb-2">Delivery Time</p>
          <div className="flex flex-wrap gap-2">
            {times.map((t) => (
              <button key={t} onClick={() => setTime(t)} className={`chip ${time === t ? "chip-on" : "chip-off"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>📍 B-2-304, Arihant Anchal, Jodhpur</span>
          <Link href="/address" className="text-blue-600 font-semibold">Badlo</Link>
        </div>

        <p className="text-sm">🏷️ PAANI20 lagaya gaya - 20% chhoot</p>

        <div className="border-2 border-gray-200 rounded-2xl p-4 text-sm space-y-1">
          <div className="flex justify-between"><span>{size.label.split(" - ")[0]} Tanker</span><span>Rs {size.price}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="text-green-600 font-semibold">FREE</span></div>
          <div className="flex justify-between"><span>Chhoot</span><span>- Rs {disc}</span></div>
          <div className="flex justify-between font-extrabold text-blue-900 text-base pt-1 border-t">
            <span>Kul</span><span>Rs {size.price - disc}</span>
          </div>
        </div>

        <button onClick={placeOrder} disabled={saving} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-60">
          {saving ? "Ruko..." : "💧 Book Karo"}
        </button>
      </main>
      <BottomNav />
    </>
  );
}
