"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const getMapUrl = (lat: any, lng: any, address?: string) => {
  if (lat && lng) return `https://www.google.com/maps?q=${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "Jodhpur")}`;
};

export default function AdminSellers() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "all">("pending");
  const [search, setSearch] = useState("");
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  const [newRate, setNewRate] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("pw_admin") || localStorage.getItem("pw_admin_token");
    if (!auth) { router.push("/admin/login"); return; }
    setReady(true);
    load();
  }, [router]);

  const load = async () => {
    const { data: s } = await supabase.from("sellers").select("*").order("created_at", { ascending: false });
    const { data: o } = await supabase.from("orders").select("seller_id,price,commission,status").limit(1000);
    if (s) setSellers(s);
    if (o) setOrders(o);
  };

  const sellerStats = useMemo(() => {
    const map: Record<string, any> = {};
    sellers.forEach(s => map[s.id] = { totalOrders: 0, totalSell: 0, commission: 0, delivered: 0, pending: 0, cancel: 0 });
    orders.forEach(o => {
      if (!map[o.seller_id]) return;
      map[o.seller_id].totalOrders += 1;
      map[o.seller_id].totalSell += Number(o.price) || 0;
      map[o.seller_id].commission += Number(o.commission) || 0;
      if (o.status === "Pahuncha") map[o.seller_id].delivered += 1;
      else if (o.status === "Cancel") map[o.seller_id].cancel += 1;
      else map[o.seller_id].pending += 1;
    });
    return map;
  }, [sellers, orders]);

  const filtered = sellers.filter(s => {
    if (tab === "pending" && s.status === "approved") return false;
    if (tab === "approved" && s.status !== "approved") return false;
    if (search) {
      const q = search.toLowerCase();
      return s.business_name?.toLowerCase().includes(q) || s.mobile?.includes(q) || s.area?.toLowerCase().includes(q);
    }
    return true;
  });

  const approve = async (id: string) => {
    await supabase.from("sellers").update({ status: "approved" }).eq("id", id);
    load();
  };
  const reject = async (id: string) => {
    if (!confirm("Reject karna hai?")) return;
    await supabase.from("sellers").update({ status: "rejected" }).eq("id", id);
    load();
  };
  const toggleBlock = async (s: any) => {
    const newStatus = s.status === "approved" ? "blocked" : "approved";
    await supabase.from("sellers").update({ status: newStatus }).eq("id", s.id);
    load();
  };
  const updateCommission = async (id: string) => {
    const rate = Number(newRate);
    if (isNaN(rate) || rate < 0 || rate > 50) { alert("0-50% tak rate dalo"); return; }
    await supabase.from("sellers").update({ commission_rate: rate }).eq("id", id);
    setEditingCommission(null);
    setNewRate("");
    load();
  };

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  const pendingCount = sellers.filter(s => s.status !== "approved" && s.status !== "blocked").length;

  return (
    <>
      <Header />
      <main className="flex-1 p-3 space-y-3 pb-24 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-blue-600 font-semibold text-sm">← Dashboard</Link>
          <h2 className="font-extrabold text-blue-900">Sellers - GPS Control</h2>
          <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full">{pendingCount} pending</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "pending", label: `Pending (${sellers.filter(s=>s.status!=="approved").length})` },
            { id: "approved", label: `Approved (${sellers.filter(s=>s.status==="approved").length})` },
            { id: "all", label: `All (${sellers.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${tab===t.id ? "gold-btn text-white" : "bg-gray-100 text-gray-600"}`}>{t.label}</button>
          ))}
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Business name / mobile / area search..." className="w-full border-2 border-amber-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-900" />

        <div className="space-y-3">
          {filtered.map(s => {
            const st = sellerStats[s.id] || { totalOrders:0, totalSell:0, commission:0, delivered:0, pending:0, cancel:0 };
            return (
              <div key={s.id} className={`gold-card rounded-2xl p-4 space-y-3 ${s.status !== "approved" ? "border-2 border-red-200 bg-red-50/30" : ""}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-extrabold text-blue-900 text-[16px]">{s.business_name}</p>
                    <p className="text-xs text-gray-600">{s.area} {s.address ? `- ${s.address}` : ""}</p>
                    <p className="text-xs mt-1">📱 +91 {s.mobile} | ⭐ {Number(s.rating || 4.5).toFixed(1)} | Commission: {s.commission_rate || 5}%</p>
                    {s.lat && s.lng ? (
                      <p className="text-xs font-bold text-green-700 mt-1">📍 GPS: {Number(s.lat).toFixed(5)}, {Number(s.lng).toFixed(5)} - Verified</p>
                    ) : (
                      <p className="text-xs font-bold text-red-500 mt-1">⚠️ GPS location missing</p>
                    )}
                    <div className="grid grid-cols-4 gap-2 mt-2 bg-white rounded-xl p-2 text-center">
                      <div><p className="font-extrabold text-blue-900 text-sm">{st.totalOrders}</p><p className="text-[9px] text-gray-400">TOTAL</p></div>
                      <div><p className="font-extrabold text-green-600 text-sm">{st.delivered}</p><p className="text-[9px] text-gray-400">DELIVERED</p></div>
                      <div><p className="font-extrabold text-amber-600 text-sm">{st.pending}</p><p className="text-[9px] text-gray-400">PENDING</p></div>
                      <div><p className="font-extrabold text-red-500 text-sm">{st.cancel}</p><p className="text-[9px] text-gray-400">CANCEL</p></div>
                    </div>
                    <p className="text-xs mt-1">Sell: <b>Rs {st.totalSell}</b> | Your Commission: <b className="text-green-600">Rs {st.commission}</b></p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${s.status==="approved" ? "bg-green-100 text-green-700" : s.status==="blocked" ? "bg-gray-800 text-white" : "bg-red-100 text-red-600"}`}>{s.status?.toUpperCase()}</span>
                </div>

                {/* Commission Edit */}
                {editingCommission === s.id ? (
                  <div className="flex gap-2 bg-blue-50 rounded-xl p-2">
                    <input value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="5" type="number" className="flex-1 border rounded-lg px-3 py-1.5 text-sm" />
                    <button onClick={() => updateCommission(s.id)} className="bg-green-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs">Save</button>
                    <button onClick={() => setEditingCommission(null)} className="bg-gray-200 font-bold px-3 py-1.5 rounded-lg text-xs">Cancel</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {s.status !== "approved" ? (
                      <>
                        <a href={getMapUrl(s.lat, s.lng, s.address)} target="_blank" className="flex-1 min-w-[100px] bg-blue-900 text-white text-center font-bold py-2.5 rounded-xl text-xs">📍 Map Verify</a>
                        <button onClick={() => approve(s.id)} className="flex-1 min-w-[100px] bg-green-600 text-white font-bold py-2.5 rounded-xl text-xs">✓ Approve</button>
                        <button onClick={() => reject(s.id)} className="flex-1 min-w-[80px] border-2 border-red-200 text-red-500 font-bold py-2.5 rounded-xl text-xs">✗ Reject</button>
                      </>
                    ) : (
                      <>
                        <a href={getMapUrl(s.lat, s.lng, s.address)} target="_blank" className="bg-blue-50 text-blue-700 font-bold px-3 py-2 rounded-xl text-xs">📍 Map</a>
                        <a href={`tel:+91${s.mobile}`} className="bg-green-50 text-green-700 font-bold px-3 py-2 rounded-xl text-xs">📞 Call</a>
                        <button onClick={() => { setEditingCommission(s.id); setNewRate(String(s.commission_rate || 5)); }} className="bg-amber-50 text-amber-700 font-bold px-3 py-2 rounded-xl text-xs">Edit {s.commission_rate || 5}%</button>
                        <button onClick={() => toggleBlock(s)} className="bg-red-50 text-red-600 font-bold px-3 py-2 rounded-xl text-xs">Block</button>
                        <Link href={`/shop/${s.id}`} className="bg-gray-100 text-gray-700 font-bold px-3 py-2 rounded-xl text-xs">Shop Dekho</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-10">Koi seller nahi mila</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
