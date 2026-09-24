"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { supabase } from "@/lib/supabase";

export default function AdminCustomers() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (localStorage.getItem("pw_admin") !== "1") {
      router.push("/admin");
      return;
    }
    (async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: orders } = await supabase.from("orders").select("mobile");
      const count: any = {};
      (orders || []).forEach((o) => { count[o.mobile] = (count[o.mobile] || 0) + 1; });
      setCustomers((profiles || []).map((p) => ({ ...p, orders: count[p.mobile] || 0 })));
    })();
  }, [router]);

  return (
    <>
      <AdminNav />
      <main className="flex-1 p-4 space-y-3 bg-gray-50">
        <h2 className="text-xl font-extrabold text-blue-900">Customers ({customers.length})</h2>
        <div className="space-y-2">
          {customers.map((c) => (
            <div key={c.id} className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-sm">
              <p className="font-bold text-blue-900">{c.name || "Naam nahi"} — {c.orders} orders</p>
              <p className="text-gray-500">📞 {c.mobile}</p>
              <p className="text-gray-500">📍 {c.address || "-"}</p>
            </div>
          ))}
          {customers.length === 0 && <p className="text-gray-400 text-sm">Abhi koi customer nahi hai</p>}
        </div>
      </main>
    </>
  );
}
