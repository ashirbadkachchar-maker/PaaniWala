"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

const tabs = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "bottle20", label: "20L Bottle", emoji: "💧" },
  { id: "camper", label: "Camper", emoji: "🔵" },
  { id: "tanker", label: "Tanker", emoji: "🚛" },
  { id: "bisleri", label: "Bisleri", emoji: "🧴" },
];

const items = [
  {
    type: "bottle20",
    name: "20L Pani Bottle",
    desc: "20 liter wali badi bottle",
    price: "Rs 30 se",
    tag: "Sabse zyada bikne wala",
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
    price: "Rs 25 se",
    tag: "Thanda & taza",
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
    price: "Rs 500 se",
    tag: "Construction / function",
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
    price: "Rs 10 se",
    tag: "1L / 500ml",
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
  const [activeTab, setActiveTab] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const m = localStorage.getItem("pw_mobile");
    if (m === "9876543210" || m === "0000000000") {
      localStorage.removeItem("pw_mobile");
    }
  }, []);

  const filtered = activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#fcfcf9] p-4 space-y-5 pb-28">
        {/* Title - clean */}
        <div className="pt-1">
          <h2 className="text-[26px] font-extrabold text-blue-950 leading-tight tracking-tight">Ghar Ghar<br/>Shuddh Paani</h2>
          <p className="text-[13px] text-gray-500 mt-1">Jodhpur me 30 min me delivery • Free delivery</p>
        </div>

        {/* Search - professional */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <span className="text-gray-400">🔍</span>
          <input disabled placeholder="Pani, camper, tanker search karo..." className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400" />
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Soon</span>
        </div>

        {/* 5 SLIDING TABS - horizontal scroll */}
        <div className="relative -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-bold border transition-all ${
                    active ? "bg-blue-900 text-white border-blue-900 shadow-md shadow-blue-900/20" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span>{t.emoji}</span> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero banner - clean professional */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-[20px] p-4 flex items-center justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[11px] font-bold tracking-widest text-amber-300 uppercase">Aaj ka offer</p>
            <p className="text-lg font-extrabold leading-tight mt-1">Pehle order pe<br/>Password FREE</p>
            <p className="text-xs text-blue-200 mt-1">4-digit password milega</p>
          </div>
          <div className="relative z-10 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur">
            <span className="text-3xl">🎁</span>
          </div>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Grid - clean cards */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-blue-900">{activeTab === "all" ? "Categories" : tabs.find(t=>t.id===activeTab)?.label}</h3>
            <span className="text-xs text-gray-400">{filtered.length} items</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <Link
                key={p.type}
                href={"/sellers?type=" + p.type}
                className="group bg-white border border-gray-100 rounded-[20px] p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-amber-100 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-50 transition-colors scale-90 origin-left">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{p.tag}</span>
                </div>
                <div>
                  <p className="font-extrabold text-blue-900 text-[15px] leading-tight">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                  <p className="text-xs font-extrabold text-amber-600 mt-2">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 flex justify-around text-center">
          <div><p className="text-sm">⚡</p><p className="text-[11px] font-bold text-gray-600 mt-1">30 Min</p></div>
          <div className="w-px bg-gray-100"></div>
          <div><p className="text-sm">💧</p><p className="text-[11px] font-bold text-gray-600 mt-1">Shuddh</p></div>
          <div className="w-px bg-gray-100"></div>
          <div><p className="text-sm">🚚</p><p className="text-[11px] font-bold text-gray-600 mt-1">Free Del.</p></div>
        </div>
      </main>
      <BottomNav />
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </>
  );
}
