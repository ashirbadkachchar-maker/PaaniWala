"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Helper
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN");
const getMapUrl = (lat: any, lng: any, address?: string) => {
  if (lat && lng) return `https://www.google.com/maps?q=${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "Jodhpur")}`;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"overview" | "approvals" | "sellers" | "orders" | "commission" | "support">("overview");
  
  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("Sab");

  // Data
  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Check - Support both old and new
  useEffect(() => {
    const oldAuth = localStorage.getItem("pw_admin");
    const token = localStorage.getItem("pw_admin_token");
    const exp = localStorage.getItem("pw_admin_exp");
    const isValid = oldAuth || (token && exp && Number(exp) > Date.now());
    if (!isValid) { router.push("/admin/login"); return; }
    setReady(true);
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    const { data: s } = await supabase.from("sellers").select("id,business_name,mobile,area,address,lat,lng,status,commission_rate,rating,created_at").order("created_at", { ascending: false });
    const { data: o } = await supabase.from("orders").select("id,order_id,seller_id,item_name,qty,price,commission,seller_earning,status,mobile,delivery_slot,created_at").order("created_at", { ascending: false }).limit(500);
    if (s) setSellers(s);
    if (o) setOrders(o);
    setLoading(false);
  };

  useEffect(() => { if (ready) loadData(); }, [ready]);

  // Filtered orders by date
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (dateFrom) list = list.filter(o => new Date(o.created_at) >= new Date(dateFrom));
    if (dateTo) list = list.filter(o => new Date(o.created_at) <= new Date(dateTo + "T23:59:59"));
    if (orderStatusFilter !== "Sab") list = list.filter(o => (o.status || "Naya") === orderStatusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o => o.order_id?.toLowerCase().includes(q) || o.mobile?.includes(q) || o.item_name?.toLowerCase().includes(q));
    }
    return list;
  }, [orders, dateFrom, dateTo, orderStatusFilter, search]);

  // Stats
  const stats = useMemo(() => {
    const pending = sellers.filter(s => s.status !== "approved").length;
    const approved = sellers.filter(s => s.status === "approved").length;
    const totalCommission = filteredOrders.reduce((sum, o) => sum + (Number(o.commission) || 0), 0);
    const totalSales = filteredOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
    const todayStr = new Date().toDateString();
    const todayEarning = orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === todayStr).reduce((s, o: any) => s + (Number(o.commission) || 0), 0);
    const delivered = filteredOrders.filter(o => o.status === "Pahuncha").length;
    const pendingOrders = filteredOrders.filter(o => ["Naya", "Confirm", "Raste Me Hai"].includes(o.status || "Naya")).length;
    const cancelled = filteredOrders.filter(o => o.status === "Cancel").length;
    return { pending, approved, total: sellers.length, totalCommission, totalSales, todayEarning, delivered, pendingOrders, cancelled, totalOrders: filteredOrders.length };
  }, [sellers, filteredOrders, orders]);

  // Seller wise aggregation
  const sellerStats = useMemo(() => {
    const map: Record<string, any> = {};
    sellers.forEach(s => {
      map[s.id] = { seller: s, totalSell: 0, totalCommission: 0, delivered: 0, pending: 0, cancelled: 0, totalOrders: 0 };
    });
    filteredOrders.forEach(o => {
      if (!map[o.seller_id]) return;
      map[o.seller_id].totalSell += Number(o.price) || 0;
      map[o.seller_id].totalCommission += Number(o.commission) || 0;
      map[o.seller_id].totalOrders += 1;
      if (o.status === "Pahuncha") map[o.seller_id].delivered += 1;
      else if (o.status === "Cancel") map[o.seller_id].cancelled += 1;
      else map[o.seller_id].pending += 1;
    });
    return Object.values(map);
  }, [sellers, filteredOrders]);

  const pendingSellers = sellers.filter(s => s.status !== "approved");

  const approveSeller = async (id: string) => {
    await supabase.from("sellers").update({ status: "approved" }).eq("id", id);
    loadData();
  };
  const rejectSeller = async (id: string) => {
    if (!confirm("Is seller ko reject/block karna hai?")) return;
    await supabase.from("sellers").update({ status: "rejected" }).eq("id", id);
    loadData();
  };
  const blockSeller = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "approved" ? "blocked" : "approved";
    await supabase.from("sellers").update({ status: newStatus }).eq("id", id);
    loadData();
  };

  // PDF Report - Monthly commission
  const downloadPDF = async () => {
    const period = dateFrom && dateTo ? `${dateFrom}_to_${dateTo}` : `All_Time_${new Date().toISOString().slice(0,10)}`;
    // Try jsPDF, fallback to CSV
    try {
      // @ts-ignore
      const jsPDFModule = await import("jspdf");
      // @ts-ignore
      await import("jspdf-autotable");
      const doc = new jsPDFModule.jsPDF();
      doc.setFontSize(16);
      doc.text("PaaniWala - Commission Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Period: ${dateFrom || "Start"} to ${dateTo || "Today"} | Generated: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Total Orders: ${stats.totalOrders} | Total Sales: Rs ${stats.totalSales} | Total Commission: Rs ${stats.totalCommission}`, 14, 34);
      
      const tableData = (sellerStats as any[]).map((s: any) => [
        s.seller.business_name,
        s.seller.area || "",
        s.totalOrders,
        `Rs ${s.totalSell}`,
        `Rs ${s.totalCommission}`,
        `${s.delivered}/${s.pending}/${s.cancelled}`
      ]);
      
      // @ts-ignore
      doc.autoTable({
        startY: 40,
        head: [["Seller", "Area", "Orders", "Total Sale", "Commission", "D/P/C"]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 58, 138] }
      });
      
      doc.save(`PaaniWala-Commission-${period}.pdf`);
    } catch (e) {
      // Fallback CSV
      const csv = [
        `PaaniWala Commission Report - ${period}`,
        `Total Orders,${stats.totalOrders},Total Sales,${stats.totalSales},Commission,${stats.totalCommission}`,
        "",
        "Seller,Area,Total Orders,Total Sell,Commission,Delivered,Pending,Cancelled"
      ].concat(
        (sellerStats as any[]).map((s: any) => 
          `"${s.seller.business_name}","${s.seller.area || ""}",${s.totalOrders},${s.totalSell},${s.totalCommission},${s.delivered},${s.pending},${s.cancelled}`
        )
      ).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PaaniWala-Commission-${period}.csv`;
      a.click();
    }
  };

  const logout = () => {
    localStorage.removeItem("pw_admin");
    localStorage.removeItem("pw_admin_token");
    localStorage.removeItem("pw_admin_exp");
    localStorage.removeItem("pw_admin_id");
    localStorage.removeItem("pw_admin_name");
    router.push("/admin/login");
  };

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  return (
    <>
      <Header />
      <main className="flex-1 p-3 space-y-3 pb-24 max-w-6xl mx-auto w-full">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-blue-900">Super Admin</h2>
            <p className="text-xs text-gray-500">Pura control yaha se</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-xl">↻ Refresh</button>
            <button onClick={logout} className="text-xs font-bold text-red-500 border border-red-200 rounded-xl px-3 py-1.5">Logout</button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="gold-card rounded-2xl p-3 flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-bold text-gray-500 uppercase">From Date</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full border rounded-xl px-2 py-1.5 text-sm" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-bold text-gray-500 uppercase">To Date</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full border rounded-xl px-2 py-1.5 text-sm" />
          </div>
          <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs bg-gray-100 px-3 py-2 rounded-xl font-bold">Clear</button>
          <button onClick={downloadPDF} className="gold-btn text-white text-xs font-bold px-4 py-2 rounded-xl">📄 PDF Report Download</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: "overview", label: `Overview` },
            { id: "support", label: `🎧 Support` },
            { id: "approvals", label: `Approvals (${stats.pending})` },
            { id: "sellers", label: `Sellers (${stats.total})` },
            { id: "orders", label: `Orders (${stats.totalOrders})` },
            { id: "commission", label: `Commission` },
          ].map(t => (
            <button key={t.id} onClick={() => {
              if (t.id === "support") { router.push("/admin/support"); return; }
              setTab(t.id as any);
            }} className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm ${tab === t.id ? "gold-btn text-white" : t.id==="support" ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <>
            {stats.pending > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                <p className="font-extrabold text-red-600">{stats.pending} seller approval me hai!</p>
                <button onClick={() => setTab("approvals")} className="text-blue-600 font-bold text-sm mt-1">Abhi approve karo →</button>
              </div>
            )}

            {/* SUPPORT CTA - NEW */}
            <Link href="/admin/support" className="block bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-extrabold text-lg">🎧 Customer Support Center</p>
                  <p className="text-xs opacity-90 mt-1">Complaint aayi? Mobile / Order ID dalke turant help karo</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-white/20 text-[10px] font-bold px-2 py-1 rounded-full">{stats.cancelled} cancel</span>
                    <span className="bg-white/20 text-[10px] font-bold px-2 py-1 rounded-full">{stats.pendingOrders} pending</span>
                  </div>
                </div>
                <div className="text-3xl">→</div>
              </div>
            </Link>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="gold-card rounded-2xl p-4 text-center">
                <p className="text-2xl font-extrabold text-blue-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Sellers</p>
                <p className="text-[10px] text-green-600 font-bold">{stats.approved} active</p>
              </div>
              <div className="gold-card rounded-2xl p-4 text-center border-red-100">
                <p className="text-2xl font-extrabold text-red-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending Approval</p>
              </div>
              <div className="gold-card rounded-2xl p-4 text-center">
                <p className="text-2xl font-extrabold text-blue-900">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">Orders (filtered)</p>
                <p className="text-[10px] text-gray-400">{stats.delivered} delivered | {stats.pendingOrders} pending | {stats.cancelled} cancel</p>
              </div>
              <div className="gold-card rounded-2xl p-4 text-center bg-green-50 border-green-200">
                <p className="text-2xl font-extrabold text-green-600">Rs {stats.totalCommission}</p>
                <p className="text-xs text-gray-500">Total Commission</p>
                <p className="text-[10px] text-amber-600 font-bold">Today: Rs {stats.todayEarning}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/support" className="gold-card rounded-2xl p-4 text-center bg-red-50 border-red-200">
                <p className="text-2xl">🎧</p>
                <p className="font-bold text-red-600 text-sm">Support</p>
                <p className="text-[10px] text-gray-500">Complaint Help</p>
              </Link>
              <Link href="/admin/sellers" className="gold-card rounded-2xl p-4 text-center">
                <p className="text-2xl">🏪</p>
                <p className="font-bold text-blue-900 text-sm">Sellers</p>
                <p className="text-[10px] text-gray-500">GPS Control</p>
              </Link>
              <Link href="/admin/orders" className="gold-card rounded-2xl p-4 text-center">
                <p className="text-2xl">📦</p>
                <p className="font-bold text-blue-900 text-sm">Orders</p>
                <p className="text-[10px] text-gray-500">Full Control</p>
              </Link>
              <Link href="/admin/commission" className="gold-card rounded-2xl p-4 text-center">
                <p className="text-2xl">💰</p>
                <p className="font-bold text-blue-900 text-sm">Commission</p>
                <p className="text-[10px] text-gray-500">PDF Report</p>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="gold-card rounded-2xl p-4">
                <p className="font-bold text-blue-900 text-sm">Sales Summary</p>
                <p className="text-xs text-gray-500 mt-1">Total Sales: <b className="text-blue-900">Rs {stats.totalSales}</b></p>
                <p className="text-xs text-gray-500">Commission: <b className="text-green-600">Rs {stats.totalCommission}</b></p>
                <p className="text-xs text-gray-500">Seller Payout: <b>Rs {stats.totalSales - stats.totalCommission}</b></p>
              </div>
              <div className="gold-card rounded-2xl p-4">
                <p className="font-bold text-blue-900 text-sm">Order Status</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between"><span>✅ Pahuncha</span><span className="font-bold text-green-600">{stats.delivered}</span></div>
                  <div className="flex justify-between"><span>🚚 Pending</span><span className="font-bold text-amber-600">{stats.pendingOrders}</span></div>
                  <div className="flex justify-between"><span>❌ Cancel</span><span className="font-bold text-red-500">{stats.cancelled}</span></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* APPROVALS WITH GPS */}
        {tab === "approvals" && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-blue-900">📍 GPS Location ke saath Approval</h3>
            {pendingSellers.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Koi pending approval nahi hai</p>}
            {pendingSellers.map((s) => (
              <div key={s.id} className="gold-card rounded-2xl p-4 space-y-3 border-amber-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-extrabold text-blue-900 text-lg">{s.business_name}</p>
                    <p className="text-sm text-gray-600">{s.area} - {s.address}</p>
                    <p className="text-xs text-gray-500 mt-1">📱 +91 {s.mobile} | ⭐ {s.rating || 4.5} | Commission: {s.commission_rate || 5}%</p>
                    {s.lat && s.lng ? (
                      <p className="text-xs font-bold text-green-700 mt-1">📍 GPS: {Number(s.lat).toFixed(5)}, {Number(s.lng).toFixed(5)}</p>
                    ) : (
                      <p className="text-xs text-red-500 font-bold">⚠️ GPS location nahi diya</p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">PENDING</span>
                </div>
                <div className="flex gap-2">
                  <a href={getMapUrl(s.lat, s.lng, s.address)} target="_blank" className="flex-1 bg-blue-900 text-white text-center font-bold py-2.5 rounded-xl text-sm">📍 Map pe Dekho</a>
                  <button onClick={() => approveSeller(s.id)} className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm">✓ Approve</button>
                  <button onClick={() => rejectSeller(s.id)} className="flex-1 border-2 border-red-200 text-red-500 font-bold py-2.5 rounded-xl text-sm">✗ Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SELLERS CONTROL */}
        {tab === "sellers" && (
          <div className="space-y-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Seller search karo..." className="w-full border-2 border-amber-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-900" />
            <div className="grid md:grid-cols-2 gap-3">
              {(sellerStats as any[]).filter((s: any) => !search || s.seller.business_name.toLowerCase().includes(search.toLowerCase())).map((s: any) => (
                <div key={s.seller.id} className="gold-card rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <p className="font-extrabold text-blue-900">{s.seller.business_name}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${s.seller.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{s.seller.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{s.seller.area} | +91 {s.seller.mobile}</p>
                  <div className="grid grid-cols-4 gap-2 text-center bg-gray-50 rounded-xl p-2">
                    <div><p className="font-extrabold text-blue-900 text-sm">{s.totalOrders}</p><p className="text-[9px] text-gray-500">TOTAL</p></div>
                    <div><p className="font-extrabold text-green-600 text-sm">{s.delivered}</p><p className="text-[9px] text-gray-500">DELIVERED</p></div>
                    <div><p className="font-extrabold text-amber-600 text-sm">{s.pending}</p><p className="text-[9px] text-gray-500">PENDING</p></div>
                    <div><p className="font-extrabold text-red-500 text-sm">{s.cancelled}</p><p className="text-[9px] text-gray-500">CANCEL</p></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Total Sell: <b className="text-blue-900">Rs {s.totalSell}</b></span>
                    <span>Commission: <b className="text-green-600">Rs {s.totalCommission}</b></span>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:+91${s.seller.mobile}`} className="flex-1 bg-green-50 text-green-700 text-center font-bold py-2 rounded-xl text-xs">📞 Call</a>
                    <a href={getMapUrl(s.seller.lat, s.seller.lng, s.seller.address)} target="_blank" className="flex-1 bg-blue-50 text-blue-700 text-center font-bold py-2 rounded-xl text-xs">📍 Map</a>
                    <button onClick={() => blockSeller(s.seller.id, s.seller.status)} className={`flex-1 font-bold py-2 rounded-xl text-xs ${s.seller.status === "approved" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{s.seller.status === "approved" ? "Block" : "Unblock"}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === "orders" && (
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto">
              {["Sab", "Naya", "Confirm", "Raste Me Hai", "Pahuncha", "Cancel"].map(st => (
                <button key={st} onClick={() => setOrderStatusFilter(st)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold ${orderStatusFilter === st ? "gold-btn text-white" : "bg-gray-100"}`}>{st}</button>
              ))}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Order ID / Mobile / Item search..." className="w-full border rounded-xl px-3 py-2 text-sm" />
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {filteredOrders.map(o => (
                <div key={o.id} className="gold-card rounded-2xl p-3 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 text-sm">{o.order_id} - {o.item_name} x{o.qty}</p>
                    <p className="text-xs text-gray-500">Rs {o.price} | Commission Rs {o.commission || 0} | {fmtDate(o.created_at)} | {o.mobile}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.status === "Pahuncha" ? "bg-green-100 text-green-700" : o.status === "Cancel" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>{o.status || "Naya"}</span>
                </div>
              ))}
              {filteredOrders.length === 0 && <p className="text-center text-gray-400 text-sm py-8">Koi order nahi mila</p>}
            </div>
          </div>
        )}

        {/* COMMISSION */}
        {tab === "commission" && (
          <div className="space-y-3">
            <div className="gold-card rounded-2xl p-4">
              <h3 className="font-extrabold text-blue-900">Monthly Commission Report</h3>
              <p className="text-xs text-gray-500 mt-1">Period: {dateFrom || "Start"} to {dateTo || "Today"} | Total: Rs {stats.totalCommission} from {stats.totalOrders} orders</p>
              <button onClick={downloadPDF} className="mt-3 gold-btn text-white font-bold px-4 py-2 rounded-xl text-sm w-full">📄 Download PDF / CSV</button>
            </div>
            <div className="gold-card rounded-2xl p-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b font-bold text-gray-500">
                    <th className="text-left p-2">Seller</th>
                    <th className="p-2">Orders</th>
                    <th className="p-2">Sale</th>
                    <th className="p-2">Commission</th>
                    <th className="p-2">D/P/C</th>
                  </tr>
                </thead>
                <tbody>
                  {(sellerStats as any[]).map((s: any) => (
                    <tr key={s.seller.id} className="border-b">
                      <td className="p-2 font-bold text-blue-900">{s.seller.business_name}<br/><span className="text-[10px] text-gray-400">{s.seller.area}</span></td>
                      <td className="p-2 text-center">{s.totalOrders}</td>
                      <td className="p-2 font-bold">Rs {s.totalSell}</td>
                      <td className="p-2 font-bold text-green-600">Rs {s.totalCommission}</td>
                      <td className="p-2 text-center">{s.delivered}/{s.pending}/{s.cancelled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
