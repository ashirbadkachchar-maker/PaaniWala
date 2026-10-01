"use client";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

const items = [
  {
    type: "bottle20",
    name: "20L Pani Bottle",
    desc: "20 liter wali badi bottle",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="1.7">
        <rect x="9" y="2" width="6" height="3" rx="1" />
        <path d="M10 5h4v2.5l2.5 3.5v8a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-8L10 7.5V5z" />
        <path d="M7.5 14h9" stroke="#f59e0b" />
        <path d="M7.5 17h9" stroke="#f59e0b" />
      </svg>
    ),
  },
  {
    type: "camper",
    name: "Camper",
    desc: "Neela pani camper",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.7">
        <rect x="9" y="2" width="6" height="3" rx="1" />
        <path d="M10 5h4v2.5l2.5 3.5v8a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-8L10 7.5V5z" />
        <path d="M12 12.5c1.2 1 1.2 2.4 0 3.4-1.2-1-1.2-2.4 0-3.4z" fill="#0284c7" stroke="none" />
      </svg>
    ),
  },
  {
    type: "tanker",
    name: "Tanker",
    desc: "Bada pani tanker",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="1.7">
        <rect x="2" y="9" width="12" height="6" rx="3" />
        <path d="M14 11h4l3 3v1h-7v-4z" />
        <circle cx="7" cy="17.5" r="1.8" />
        <circle cx="17" cy="17.5" r="1.8" />
      </svg>
    ),
  },
  {
    type: "bisleri",
    name: "Bisleri Bottles",
    desc: "Chhoti branded bottles",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.7">
        <path d="M5 8h3v2l1 2v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7l1-2V8z" />
        <path d="M10.5 8h3v2l1 2v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-7l1-2V8z" />
        <path d="M16 8h3v2l1 2v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-7l1-2V8z" />
        <path d="M5.8 5h1.4M11.3 5h1.4M16.8 5h1.4" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-900">Ghar Ghar Shuddh Paani</h2>
          <p className="text-sm text-gray-500">Product chuno - nazdeeki seller se order karo, login baad me</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {items.map((p) => (
            <Link
              key={p.type}
              href={"/sellers?type=" + p.type}
              className="gold-card rounded-2xl p-4 flex flex-col items-center text-center gap-2"
            >
              {p.icon}
              <span className="font-extrabold text-blue-900">{p.name}</span>
              <span className="text-xs text-gray-500">{p.desc}</span>
            </Link>
          ))}
        </div>
        <div className="gold-card rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-blue-900">Pehli baar order par login password FREE</p>
          <p className="text-xs text-gray-500 mt-1">Order ke baad 4-digit password milega - agli baar seedha login</p>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
