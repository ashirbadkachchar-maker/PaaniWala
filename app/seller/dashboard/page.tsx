"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SellerDashboard() {
  const router = useRouter();
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState("");
  const [stats, setStats] = useState({ orders: 0, products: 0, earning: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const sid = localStorage.getItem("pw_seller_id");
    if (!sid) { router.push("/seller/login"); return; }
    setSellerId(sid);
    setSellerName(localStorage.getItem("pw_seller_name") || "Seller");
    (async () => {
      const { data: orders } = await supabase
       .from("orders")
       .select("id,item_name,qty,price,seller_earning,status,created_at")
       .eq("seller_id", sid)
       .order("created_at", { ascending: false })
       .limit(20);
      const { data: products } = await supabase
       .from("products")
       .select("id")
       .eq("seller_id", sid);
      const list = orders || [];
      const today = new Date().toDateString();
      const todayOrders = list.filter((o: any) => o.created_at && new Date(o.created_at).toDateString() === today);
      const earning = todayOrders.reduce((s: number, o: any) => s + (Number(o.seller_earning) || 0), 0);
      setStats({ orders: todayOrders.length, products: (products || []).length, earning });
      setRecent(list.slice(0, 5));
    })();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("pw_seller_id");
    localStorage.removeItem("pw_seller_name");
    router.push("/seller/login");
  };

  if (!sellerId) {
    return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-blue-900">Namaste, {sellerName}</h2>
            <p className="text-sm text-gray-500">Aaj ka hisab</p>
          </div>
          <button onClick={logout} className="text-sm font-bold text-red-500 border border-red-200 rounded-xl px-3 py-1.5">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="gold-card rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold text-blue-900">{stats.orders}</p>
            <p className="text-xs text-gray-500">Aaj ke orders</p>
          </div>
          <div className="gold-card rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold text-blue-900">{stats.products}</p>
            <p className="text-xs text-gray-500">Products</p>
          </div>
          <div className="gold-card rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold text-amber-600">Rs {stats.earning}</p>
            <p className="text-xs text-gray-500">Aaj ki kamai</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/seller/products" className="gold-btn rounded-2xl p-4 text-white font-bold text-center">
            Mere Products
          </Link>
          <Link href="/seller/products/add" className="bg-blue-900 rounded-2xl p-4 text-white font-bold text-center">
            + Naya Product
          </Link>
        </div>

        <Link href="/seller/orders" className="block bg-green-700 rounded-2xl p-4 text-white font-bold text-center">
          Orders Dekho
        </Link>

        <div>
          <p className="font-extrabold text-blue-900 mb-2">Taze Orders</p>
          <div className="space-y-2">
            {recent.map((o) => (
              <div key={o.id} className="gold-card rounded-2xl p-3 flex justify-between items-center gap-2">
                <div>
                  <p className="font-bold text-blue-900 text-sm">{o.item_name}</p>
                  <p className="text-xs text-gray-500">{o.status || "Naya"}</p>
                </div>
                <span className="font-extrabold text-amber-600 whitespace-nowrap">Rs {o.price}</span>
              </div>
            ))}
            {recent.length === 0 && (
              <p className="text-sm text-gray-400 text-center">Abhi koi order nahi hai</p>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
