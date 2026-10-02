"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminSellers() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");

  const load = async () => {
    const { data } = await supabase.from("sellers").select("*").order("created_at", { ascending: false });
    if (data) setSellers(data);
  };

  useEffect(() => {
    if (!localStorage.getItem("pw_admin")) { router.push("/admin/login"); return; }
    setReady(true);
    load();
  }, [router]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("sellers").update({ status }).eq("id", id);
    load();
  };

  const updateCommission = async (id: string, rate: string) => {
    const r = parseInt(rate);
    if (!r || r < 0 || r > 50) return;
    await supabase.from("sellers").update({ commission_rate: r }).eq("id", id);
    load();
  };

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  const filtered = filter === "all"? sellers : sellers.filter((s) => (filter === "pending"? s.status!== "approved" : s.status === "approved"));

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <Link href="/admin/dashboard" className="text-blue-600 font-semibold text-sm">← Dashboard</Link>
        <h2 className="text-xl font-extrabold text-blue-900">Sellers Manage Karo</h2>

        <div className="flex gap-2">
          <button onClick={() => setFilter("pending")} className={"px-4 py-2 rounded-full font-bold text-sm " + (filter === "pending"? "gold-btn text-white" : "bg-gray-100 text-gray-500")}>
            Pending ({sellers.filter((s) => s.status!== "approved").length})
          </button>
          <button onClick={() => setFilter("approved")} className={"px-4 py-2 rounded-full font-bold text-sm " + (filter === "approved"? "gold-btn text-white" : "bg-gray-100 text-gray-500")}>
            Approved
          </button>
          <button onClick={() => setFilter("all")} className={"px-4 py-2 rounded-full font-bold text-sm " + (filter === "all"? "gold-btn text-white" : "bg-gray-100 text-gray-500")}>
            Sab
          </button>
        </div>

        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="gold-card rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-extrabold text-blue-900">{s.business_name}</p>
                  <p className="text-sm text-gray-500">{s.owner_name} • +91 {s.mobile}</p>
                  <p className="text-xs text-gray-400">{s.area} {s.address? "• " + s.address : ""}</p>
                  {s.lat && s.lng && (
                    <a href={"https://maps.google.com/?q=" + s.lat + "," + s.lng} target="_blank" className="text-xs text-blue-600 font-semibold">📍 Map par dekho</a>
                  )}
                </div>
                <span className={"text-xs font-bold px-3 py-1 rounded-full " + (s.status === "approved"? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                  {s.status || "pending"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Commission:</span>
                <span className="font-bold text-blue-900">{s.commission_rate || 5}%</span>
                <input
                  className="w-16 border-2 border-amber-200 rounded-lg px-2 py-1 text-center font-bold text-sm"
                  placeholder="5"
                  defaultValue={s.commission_rate || 5}
                  onBlur={(e) => updateCommission(s.id, e.target.value)}
                />
                <span className="text-xs text-gray-400">%</span>
              </div>

              {s.status!== "approved"? (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(s.id, "approved")} className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl">✓ Approve Karo</button>
                  <button onClick={() => updateStatus(s.id, "rejected")} className="flex-1 border-2 border-red-200 text-red-500 font-bold py-2.5 rounded-xl">✗ Reject</button>
                </div>
              ) : (
                <button onClick={() => updateStatus(s.id, "pending")} className="w-full border-2 border-gray-200 text-gray-500 font-bold py-2 rounded-xl text-sm">Wapas Pending Karo</button>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-400 text-center">Koi seller nahi hai</p>}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
