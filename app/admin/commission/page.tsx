"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminCommission() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [period, setPeriod] = useState<"today" | "week" | "month" | "all">("month");

  useEffect(() => {
    const auth = localStorage.getItem("pw_admin") || localStorage.getItem("pw_admin_token");
    if (!auth) { router.push("/admin/login"); return; }
    setReady(true);
    const now = new Date();
    if (period === "today") {
      setDateFrom(now.toISOString().slice(0,10));
      setDateTo(now.toISOString().slice(0,10));
    } else if (period === "week") {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate()-7);
      setDateFrom(weekAgo.toISOString().slice(0,10));
      setDateTo(now.toISOString().slice(0,10));
    } else if (period === "month") {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      setDateFrom(first.toISOString().slice(0,10));
      setDateTo(now.toISOString().slice(0,10));
    } else {
      setDateFrom(""); setDateTo("");
    }
  }, [router, period]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      const { data: o } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(1000);
      const { data: s } = await supabase.from("sellers").select("id,business_name,area,commission_rate");
      if (o) setOrders(o);
      if (s) setSellers(s);
    })();
  }, [ready]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (dateFrom) list = list.filter(o => new Date(o.created_at) >= new Date(dateFrom));
    if (dateTo) list = list.filter(o => new Date(o.created_at) <= new Date(dateTo + "T23:59:59"));
    return list;
  }, [orders, dateFrom, dateTo]);

  const report = useMemo(() => {
    const totalSale = filtered.reduce((s,o) => s + (Number(o.price)||0), 0);
    const totalCommission = filtered.reduce((s,o) => s + (Number(o.commission)||0), 0);
    const totalOrders = filtered.length;
    const delivered = filtered.filter(o => o.status === "Pahuncha").length;
    const avgOrder = totalOrders? Math.round(totalSale/totalOrders) : 0;
    const sellerMap: Record<string, any> = {};
    sellers.forEach(s => sellerMap[s.id] = { seller: s, orders:0, sale:0, commission:0 });
    filtered.forEach(o => {
      if (!sellerMap[o.seller_id]) sellerMap[o.seller_id] = { seller: { business_name: "Unknown", area: "" }, orders:0, sale:0, commission:0 };
      sellerMap[o.seller_id].orders +=1;
      sellerMap[o.seller_id].sale += Number(o.price)||0;
      sellerMap[o.seller_id].commission += Number(o.commission)||0;
    });
    const sellerWise = Object.values(sellerMap).filter((x:any) => x.orders>0).sort((a:any,b:any) => b.commission - a.commission);
    const monthMap: Record<string, any> = {};
    filtered.forEach(o => {
      const m = new Date(o.created_at).toISOString().slice(0,7);
      if (!monthMap[m]) monthMap[m] = { month: m, orders:0, sale:0, commission:0 };
      monthMap[m].orders +=1;
      monthMap[m].sale += Number(o.price)||0;
      monthMap[m].commission += Number(o.commission)||0;
    });
    const monthly = Object.values(monthMap).sort((a:any,b:any) => a.month.localeCompare(b.month));
    return { totalSale, totalCommission, totalOrders, delivered, avgOrder, sellerWise, monthly };
  }, [filtered, sellers]);

  // FIXED - NO NPM IMPORT, CDN se
  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.body.appendChild(s);
  });

  const downloadPDF = async () => {
    const fileNamePeriod = dateFrom && dateTo? `${dateFrom}_to_${dateTo}` : period;
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js");
      // @ts-ignore
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(30,58,138);
      doc.text("PaaniWala - Monthly Commission Report", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(0,0,0);
      doc.text(`Period: ${dateFrom||"Start"} to ${dateTo||"Today"} | Generated: ${new Date().toLocaleString("en-IN")}`, 14, 28);
      doc.text(`Total Orders: ${report.totalOrders} | Delivered: ${report.delivered} | Avg Order: Rs ${report.avgOrder}`, 14, 34);
      doc.text(`Total Sales: Rs ${report.totalSale} | Total Commission: Rs ${report.totalCommission} | Payout: Rs ${report.totalSale - report.totalCommission}`, 14, 40);
      // @ts-ignore
      doc.autoTable({
        startY: 45,
        head: [["Seller", "Area", "Orders", "Total Sale", "Commission"]],
        body: (report.sellerWise as any[]).map((s:any) => [s.seller.business_name, s.seller.area||"", s.orders, `Rs ${s.sale}`, `Rs ${s.commission}`]),
        headStyles: { fillColor: [30,58,138] },
        styles: { fontSize: 9 }
      });
      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.text("Monthly Breakdown:", 14, finalY);
      // @ts-ignore
      doc.autoTable({
        startY: finalY+5,
        head: [["Month", "Orders", "Sale", "Commission"]],
        body: (report.monthly as any[]).map((m:any) => [m.month, m.orders, `Rs ${m.sale}`, `Rs ${m.commission}`]),
        headStyles: { fillColor: [245,158,11] },
        styles: { fontSize: 9 }
      });
      doc.save(`PaaniWala-Commission-${fileNamePeriod}.pdf`);
    } catch {
      const csv = [
        `PaaniWala Commission Report,${fileNamePeriod}`,
        `Total Orders,${report.totalOrders},Delivered,${report.delivered},Total Sale,${report.totalSale},Commission,${report.totalCommission}`,
        "",
        "Seller,Area,Orders,Sale,Commission",
       ...(report.sellerWise as any[]).map((s:any) => `"${s.seller.business_name}","${s.seller.area||""}",${s.orders},${s.sale},${s.commission}`),
        "",
        "Month,Orders,Sale,Commission",
       ...(report.monthly as any[]).map((m:any) => `${m.month},${m.orders},${m.sale},${m.commission}`)
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PaaniWala-Commission-${fileNamePeriod}.csv`;
      a.click();
    }
  };

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  return (
    <>
      <Header />
      <main className="flex-1 p-3 space-y-3 pb-24 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-blue-600 font-semibold text-sm">← Dashboard</Link>
          <h2 className="font-extrabold text-blue-900">Commission Report</h2>
          <button onClick={downloadPDF} className="gold-btn text-white text-xs font-bold px-3 py-1.5 rounded-xl">📄 PDF</button>
        </div>
        <div className="flex gap-2">
          {[{ id: "today", label: "Today" },{ id: "week", label: "This Week" },{ id: "month", label: "This Month" },{ id: "all", label: "All Time" }].map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id as any)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${period===p.id? "gold-btn text-white" : "bg-gray-100"}`}>{p.label}</button>
          ))}
        </div>
        <div className="gold-card rounded-2xl p-3 flex gap-2">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="flex-1 border rounded-xl px-2 py-2 text-xs" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="flex-1 border rounded-xl px-2 py-2 text-xs" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="gold-card rounded-2xl p-3 text-center"><p className="text-xl font-extrabold text-blue-900">{report.totalOrders}</p><p className="text-xs text-gray-500">Total Orders</p><p className="text-[10px] text-green-600">{report.delivered} delivered</p></div>
          <div className="gold-card rounded-2xl p-3 text-center"><p className="text-xl font-extrabold text-amber-600">Rs {report.totalSale}</p><p className="text-xs text-gray-500">Total Sales</p></div>
          <div className="gold-card rounded-2xl p-3 text-center bg-green-50 border-green-200"><p className="text-xl font-extrabold text-green-600">Rs {report.totalCommission}</p><p className="text-xs text-gray-500">Your Commission</p></div>
          <div className="gold-card rounded-2xl p-3 text-center"><p className="text-xl font-extrabold text-blue-900">Rs {report.avgOrder}</p><p className="text-xs text-gray-500">Avg Order Value</p></div>
        </div>
        <div className="gold-card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-blue-900 text-sm">Seller Wise Commission</h3>
            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full">{dateFrom} to {dateTo || "Today"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-gray-400"><th className="text-left p-2">Seller</th><th className="p-2">Orders</th><th className="p-2">Sale</th><th className="p-2">Commission</th></tr></thead>
              <tbody>
                {(report.sellerWise as any[]).map((s:any) => (
                  <tr key={s.seller.id || s.seller.business_name} className="border-b">
                    <td className="p-2"><p className="font-bold text-blue-900">{s.seller.business_name}</p><p className="text-[10px] text-gray-400">{s.seller.area}</p></td>
                    <td className="p-2 text-center font-bold">{s.orders}</td>
                    <td className="p-2">Rs {s.sale}</td>
                    <td className="p-2 font-bold text-green-600">Rs {s.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="gold-card rounded-2xl p-4">
          <h3 className="font-bold text-blue-900 text-sm mb-2">Monthly Breakdown</h3>
          <div className="space-y-2">
            {(report.monthly as any[]).map((m:any) => (
              <div key={m.month} className="flex justify-between items-center bg-gray-50 rounded-xl p-2">
                <span className="font-bold text-blue-900 text-xs">{m.month}</span>
                <span className="text-xs">{m.orders} orders</span>
                <span className="text-xs font-bold">Rs {m.sale}</span>
                <span className="text-xs font-bold text-green-600">Rs {m.commission}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={downloadPDF} className="gold-btn w-full text-white font-bold py-3 rounded-2xl">📄 Download Full PDF Report</button>
      </main>
      <BottomNav />
    </>
  );
}
