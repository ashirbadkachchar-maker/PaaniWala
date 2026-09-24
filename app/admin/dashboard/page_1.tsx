"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ orders: 0, pending: 0, revenue: 0, customers: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (localStorage.getItem("pw_admin") !== "1") {
      router.push("/admin");
      return;
    }
    (async () => {
      const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      const { data: profiles } = await supabase.from("profiles").select("id");
      const list = orders || [];
      setStats({
        orders: list.length,
        pending: list.filter((o) => o.status === "Raste Me Hai").length,
        revenue: list.reduce((s, o) => s + (o.total || 0), 0),
        customers: (profiles || []).length,
      });
      setRecent(list.slice(0, 5));
    })();
  }, [router]);

  const cards = [
    { label: "Kul Orders", value: stats.orders, bg: "bg-blue-100 text-blue-900" },
    { label: "Pending", value: stats.pending, bg: "bg-amber-100 text-amber-800" },
    { label: "Revenue", value: "Rs " + stats.revenue, bg: "bg-green-100 text-green-800" },
    { label: "Customers", value: stats.customers, bg: "bg-purple-100 text-purple-800" },
  ];

  return (
    <>
      <AdminNav />
      <main className="flex-1 p-4 space-y-4 bg-gray-50">
        <h2 className="text-xl font-extrabold text-blue-900">Dashboard</h2>
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div key={c.label} className={`${c.bg} rounded-2xl p-4`}>
              <p className="text-2xl font-extrabold">{c.value}</p>
              <p className="text-sm font-semibold">{c.label}</p>
            </div>
          ))}
        </div>
        <h3 className="font-bold text-blue-900">Taze Orders</h3>
        <div className="space-y-2">
          {recent.map((o) => (
            <div key={o.id} className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-sm flex justify-between">
              <div>
                <p className="font-bold text-blue-900">{o.order_id} — {o.item_name}</p>
                <p className="text-gray-500">Rs {o.total} · {o.mobile}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-800 h-fit">
                {o.status}
              </span>
            </div>
          ))}
          {recent.length === 0 && <p className="text-gray-400 text-sm">Abhi koi order nahi hai</p>}
        </div>
      </main>
    </>
  );
}
