"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminOrders() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [sellers, setSellers] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState("Sab");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_high" | "price_low">("newest");

  useEffect(() => {
    const auth = localStorage.getItem("pw_admin") || localStorage.getItem("pw_admin_token");
    if (!auth) { router.push("/admin/login"); return; }
    setReady(true);
    load();
  }, [router]);

  const load = async () => {
    const { data: o } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    const { data: s } = await supabase.from("sellers").select("id,business_name");
    if (o) setOrders(o);
    if (s) {
      const m: Record<string, string> = {};
      s.forEach((x: any) => m[x.id] = x.business_name);
      setSellers(m);
    }
  };

  const changeStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Order status ko "${newStatus}" karna hai?`)) return;
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    load();
  };

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "Sab") list = list.filter(o => (o.status || "Naya") === statusFilter);
    if (dateFrom) list = list.filter(o => new Date(o.created_at) >= new Date(dateFrom));
    if (dateTo) list = list.filter(o => new Date(o.created_at) <= new Date(dateTo + "T23:59:59"));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o => 
        o.order_id?.toLowerCase().includes(q) ||
        o.mobile?.includes(q) ||
        o.item_name?.toLowerCase().includes(q) ||
        sellers[o.seller_id]?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "newest") list.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sortBy === "price_high") list.sort((a,b) => (Number(b.price)||0) - (Number(a.price)||0));
    if (sortBy === "price_low") list.sort((a,b) => (Number(a.price)||0) - (Number(b.price)||0));
    return list;
  }, [orders, statusFilter, search, dateFrom, dateTo, sortBy, sellers]);

  const stats = useMemo(() => {
    return {
      total: filtered.length,
      naya: filtered.filter(o => (o.status || "Naya") === "Naya").length,
      confirm: filtered.filter(o => o.status === "Confirm").length,
      raste: filtered.filter(o => o.status === "Raste Me Hai").length,
      pahuncha: filtered.filter(o => o.status === "Pahuncha").length,
      cancel: filtered.filter(o => o.status === "Cancel").length,
      totalSale: filtered.reduce((s, o) => s + (Number(o.price)||0), 0),
      commission: filtered.reduce((s, o) => s + (Number(o.commission)||0), 0),
    };
  }, [filtered]);

  const downloadCSV = () => {
    const header = "Order ID,Seller,Item,Qty,Price,Commission,Status,Mobile,Date,Address\n";
    const rows = filtered.map(o => `"${o.order_id}","${sellers[o.seller_id]||o.seller_id}","${o.item_name}",${o.qty},${o.price},${o.commission||0},"${o.status||"Naya"}","${o.mobile}","${o.created_at}","${(o.address||"").replace(/"/g,'""')}"`).join("\n");
    const blob = new Blob([header+rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PaaniWala-Orders-${dateFrom||"all"}-to-${dateTo||"today"}.csv`;
    a.click();
  };

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  return (
    <>
      <Header />
      <main className="flex-1 p-3 space-y-3 pb-24 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-blue-600 font-semibold text-sm">← Dashboard</Link>
          <h2 className="font-extrabold text-blue-900">Orders Control</h2>
          <button onClick={downloadCSV} className="text-xs gold-btn text-white font-bold px-3 py-1.5 rounded-xl">📥 CSV</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <div className="bg-blue-900 text-white rounded-xl p-2 text-center"><p className="font-extrabold">{stats.total}</p><p className="text-[9px]">TOTAL</p></div>
          <div className="bg-amber-100 text-amber-700 rounded-xl p-2 text-center"><p className="font-extrabold">{stats.naya}</p><p className="text-[9px]">NAYA</p></div>
          <div className="bg-blue-100 text-blue-700 rounded-xl p-2 text-center"><p className="font-extrabold">{stats.confirm}</p><p className="text-[9px]">CONFIRM</p></div>
          <div className="bg-purple-100 text-purple-700 rounded-xl p-2 text-center"><p className="font-extrabold">{stats.raste}</p><p className="text-[9px]">RASTE ME</p></div>
          <div className="bg-green-100 text-green-700 rounded-xl p-2 text-center"><p className="font-extrabold">{stats.pahuncha}</p><p className="text-[9px]">PAHUNCHA</p></div>
          <div className="bg-red-100 text-red-600 rounded-xl p-2 text-center"><p className="font-extrabold">{stats.cancel}</p><p className="text-[9px]">CANCEL</p></div>
        </div>

        <div className="gold-card rounded-xl p-3 flex justify-between text-xs">
          <span>Total Sale: <b className="text-blue-900">Rs {stats.totalSale}</b></span>
          <span>Commission: <b className="text-green-600">Rs {stats.commission}</b></span>
          <span>Payout: <b>Rs {stats.totalSale - stats.commission}</b></span>
        </div>

        {/* Filters */}
        <div className="gold-card rounded-2xl p-3 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded-lg px-2 py-1.5 text-xs flex-1" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded-lg px-2 py-1.5 text-xs flex-1" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="border rounded-lg px-2 py-1.5 text-xs">
              <option value="newest">Newest First</option>
              <option value="price_high">Price High → Low</option>
              <option value="price_low">Price Low → High</option>
            </select>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Order ID / Mobile / Seller / Item search..." className="w-full border rounded-xl px-3 py-2 text-sm" />
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {["Sab", "Naya", "Confirm", "Raste Me Hai", "Pahuncha", "Cancel"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold ${statusFilter===s ? "gold-btn text-white" : "bg-gray-100"}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-2">
          {filtered.map(o => (
            <div key={o.id} className="gold-card rounded-2xl p-3 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-bold text-blue-900 text-sm">{o.order_id} - {sellers[o.seller_id] || "Unknown Seller"}</p>
                  <p className="text-xs text-gray-600">{o.item_name} x{o.qty} - Rs {o.price} (Comm: Rs {o.commission||0})</p>
                  <p className="text-xs text-gray-500">📱 +91 {o.mobile} | 🕒 {o.delivery_slot} | {new Date(o.created_at).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-600 mt-1">📍 {o.address}</p>
                  {o.delivery_otp && <p className="text-xs font-bold text-green-600">🔑 Delivery OTP: {o.delivery_otp}</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${o.status==="Pahuncha" ? "bg-green-100 text-green-700" : o.status==="Cancel" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>{o.status||"Naya"}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <a href={`tel:+91${o.mobile}`} className="bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-full text-[11px]">📞 Buyer Call</a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address||"Jodhpur")}`} target="_blank" className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-full text-[11px]">📍 Map</a>
                {o.status !== "Pahuncha" && o.status !== "Cancel" && (
                  <>
                    {o.status === "Naya" && <button onClick={() => changeStatus(o.id, "Confirm")} className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-full text-[11px]">Confirm</button>}
                    {o.status === "Confirm" && <button onClick={() => changeStatus(o.id, "Raste Me Hai")} className="bg-purple-600 text-white font-bold px-3 py-1.5 rounded-full text-[11px]">Raste Me Bhejo</button>}
                    {o.status === "Raste Me Hai" && <button onClick={() => changeStatus(o.id, "Pahuncha")} className="bg-green-600 text-white font-bold px-3 py-1.5 rounded-full text-[11px]">Pahuncha</button>}
                    <button onClick={() => changeStatus(o.id, "Cancel")} className="border border-red-200 text-red-500 font-bold px-3 py-1.5 rounded-full text-[11px]">Cancel</button>
                  </>
                )}
                <Link href={`/track/${o.order_id}`} className="bg-gray-100 font-bold px-3 py-1.5 rounded-full text-[11px]">Track Dekho</Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-10">Koi order nahi mila</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
