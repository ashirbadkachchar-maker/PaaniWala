"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { supabase } from "@/lib/supabase";

export default function AdminSellers() {
  const router = useRouter();
  const [sellers, setSellers] = useState<any[]>([]);

  useEffect(() => {
    if (localStorage.getItem("pw_admin") !== "1") { router.push("/admin"); return; }
    supabase.from("sellers").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setSellers(data); });
  }, [router]);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("sellers").update({ status }).eq("id", id);
    setSellers(sellers.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const setRate = async (id: string, rate: number) => {
    await supabase.from("sellers").update({ commission_rate: rate }).eq("id", id);
    setSellers(sellers.map((s) => (s.id === id ? { ...s, commission_rate: rate } : s)));
  };

  const pending = sellers.filter((s) => s.status === "pending");
  const approved = sellers.filter((s) => s.status === "approved");

  return (
    <>
      <AdminNav />
      <main className="flex-1 p-4 space-y-4 bg-gray-50">
        <h2 className="text-xl font-extrabold text-blue-900">Sellers</h2>
        <h3 className="font-bold text-blue-900">Approval Baki ({pending.length})</h3>
        <div className="space-y-2">
          {pending.map((s) => (
            <div key={s.id} className="bg-white border-2 border-amber-300 rounded-2xl p-3 text-sm space-y-1">
              <p className="font-bold text-blue-900">{s.business_name}</p>
              <p className="text-gray-500">{s.owner_name} - {s.mobile}</p>
              <p className="text-gray-500">{s.area} - {s.address}</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setStatus(s.id, "approved")} className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full">Approve Karo</button>
                <button onClick={() => setStatus(s.id, "rejected")} className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full">Reject</button>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-gray-400 text-sm">Koi pending nahi</p>}
        </div>
        <h3 className="font-bold text-blue-900">Approved Sellers ({approved.length})</h3>
        <div className="space-y-2">
          {approved.map((s) => (
            <div key={s.id} className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-sm space-y-2">
              <p className="font-bold text-blue-900">{s.business_name}</p>
              <p className="text-gray-500">{s.owner_name} - {s.mobile} - {s.area}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Commission %</span>
                <input type="number" className="input-gold text-sm w-20" value={s.commission_rate || 5}
                  onChange={(e) => setSellers(sellers.map((x) => (x.id === s.id ? { ...x, commission_rate: parseInt(e.target.value) || 0 } : x)))} />
                <button onClick={() => setRate(s.id, s.commission_rate || 5)} className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-full">Save</button>
                <button onClick={() => setStatus(s.id, "rejected")} className="text-red-500 text-xs font-bold ml-auto">Band Karo</button>
              </div>
            </div>
          ))}
          {approved.length === 0 && <p className="text-gray-400 text-sm">Abhi koi approved seller nahi</p>}
        </div>
      </main>
    </>
  );
}
