"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { supabase } from "@/lib/supabase";

export default function AdminBills() {
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [mobile, setMobile] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (localStorage.getItem("pw_admin") !== "1") {
      router.push("/admin");
      return;
    }
    supabase.from("bills").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setBills(data); });
  }, [router]);

  const addBill = async () => {
    if (!mobile || !month || !amount) return;
    const { data } = await supabase.from("bills")
      .insert({ mobile: mobile.replace(/\D/g, ""), month, amount: parseInt(amount) })
      .select().single();
    if (data) {
      setBills([data, ...bills]);
      setMobile(""); setMonth(""); setAmount("");
    }
  };

  const togglePaid = async (b: any) => {
    const paid = !b.paid;
    await supabase.from("bills").update({
      paid, paid_at: paid ? new Date().toISOString() : null,
    }).eq("id", b.id);
    setBills(bills.map((x) => (x.id === b.id ? { ...x, paid } : x)));
  };

  const delBill = async (id: string) => {
    await supabase.from("bills").delete().eq("id", id);
    setBills(bills.filter((x) => x.id !== id));
  };

  return (
    <>
      <AdminNav />
      <main className="flex-1 p-4 space-y-3 bg-gray-50">
        <h2 className="text-xl font-extrabold text-blue-900">Bills</h2>

        <div className="bg-white border-2 border-amber-300 rounded-2xl p-3 space-y-2">
          <p className="font-bold text-blue-900 text-sm">Naya Bill Banao</p>
          <input className="input-gold text-sm" placeholder="Mobile number" value={mobile}
            onChange={(e) => setMobile(e.target.value)} inputMode="numeric" />
          <input className="input-gold text-sm" placeholder="Mahina (jaise October 2026)" value={month}
            onChange={(e) => setMonth(e.target.value)} />
          <input className="input-gold text-sm" placeholder="Rakam (Rs)" value={amount}
            onChange={(e) => setAmount(e.target.value)} inputMode="numeric" />
          <button onClick={addBill} className="gold-btn w-full text-white font-bold py-2 rounded-2xl text-sm">
            Bill Jodo
          </button>
        </div>

        <div className="space-y-2">
          {bills.map((b) => (
            <div key={b.id} className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-blue-900">{b.month} — Rs {b.amount}</p>
                <p className="text-gray-500">{b.mobile}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePaid(b)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${b.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {b.paid ? "Paid" : "Bakaaya"}
                </button>
                <button onClick={() => delBill(b.id)} className="text-red-500 font-bold">✕</button>
              </div>
            </div>
          ))}
          {bills.length === 0 && <p className="text-gray-400 text-sm">Koi bill nahi hai</p>}
        </div>
      </main>
    </>
  );
}
