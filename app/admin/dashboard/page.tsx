"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState({ sellers: 0, pending: 0, orders: 0, todayEarning: 0, totalEarning: 0 });

  useEffect(() => {
    if (!localStorage.getItem("pw_admin")) { router.push("/admin/login"); return; }
    setReady(true);
    (async () => {
      const { data: sellers } = await supabase.from("sellers").select("id,status");
      const { data: orders } = await supabase.from("orders").select("commission,created_at");
      const pending = (sellers || []).filter((s: any) => s.status!== "approved").length;
      const totalEarning = (orders || []).reduce((sum: number, o: any) => sum + (Number(o.commission) || 0), 0);
      const today = new Date().toDateString();
      const todayEarning = (orders || []).filter((o: any) => o.created_at && new Date(o.created_at).toDateString() === today).reduce((sum: number, o: any) => sum + (Number(o.commission) || 0), 0);
      setStats({ sellers: (sellers || []).length, pending, orders: (orders || []).length, todayEarning, totalEarning });
    })();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("pw_admin");
    router.push("/admin/login");
  };

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-blue-900">Admin Panel</h2>
          <button onClick={logout} className="text-sm font-bold text-red-500 border border-red-200 rounded-xl px-3 py-1.5">Logout</button>
        </div>

        {stats.pending > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
            <p className="font-extrabold text-red-600">{stats.pending} seller approval me hai!</p>
            <Link href="/admin/sellers" className="text-blue-600 font-bold text-sm">Abhi approve karo →</Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="gold-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-blue-900">{stats.sellers}</p>
            <p className="text-xs text-gray-500">Total Sellers</p>
          </div>
          <div className="gold-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-red-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="gold-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-blue-900">{stats.orders}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </div>
          <div className="gold-card rounded-2xl p-4 text-center bg-green-50">
            <p className="text-2xl font-extrabold text-green-600">Rs {stats.totalEarning}</p>
            <p className="text-xs text-gray-500">Total Commission</p>
          </div>
        </div>

        <div className="gold-card rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-500">Aaj ki kamai</p>
          <p className="text-3xl font-extrabold text-amber-600">Rs {stats.todayEarning}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/sellers" className="gold-btn rounded-2xl p-4 text-white font-bold text-center">
            Sellers Approve Karo
          </Link>
          <Link href="/admin/orders" className="bg-blue-900 rounded-2xl p-4 text-white font-bold text-center">
            Saare Orders Dekho
          </Link>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
