"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SupportTicket = {
  order: any;
  sellerName: string;
  profile: any;
  delay: string;
};

export default function AdminSupport() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [sellers, setSellers] = useState<Record<string, any>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "delayed" | "today" | "complaint">("all");
  const [selected, setSelected] = useState<any>(null);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("pw_admin") || localStorage.getItem("pw_admin_token");
    if (!auth) { router.push("/admin/login"); return; }
    setReady(true);
    loadAll();
  }, [router]);

  const loadAll = async () => {
    setLoading(true);
    const { data: o } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    const { data: s } = await supabase.from("sellers").select("id,business_name,mobile,area,address");
    const { data: p } = await supabase.from("profiles").select("mobile,name,address,password,created_at").limit(500);
    
    if (o) setOrders(o);
    if (s) {
      const m: Record<string, any> = {};
      s.forEach((x:any) => m[x.id] = x);
      setSellers(m);
    }
    if (p) {
      const m: Record<string, any> = {};
      p.forEach((x:any) => m[x.mobile] = x);
      setProfiles(m);
    }
    setLoading(false);
  };

  const getDelay = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(diff / (1000*60*60));
    if (hours < 1) return `${Math.floor(diff/60000)} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours/24)} din pehle`;
  };

  const filtered = useMemo(() => {
    let list = [...orders];
    
    // Complaint filters
    if (filter === "today") {
      const today = new Date().toDateString();
      list = list.filter(o => new Date(o.created_at).toDateString() === today);
    }
    if (filter === "delayed") {
      // Raste Me Hai > 2 hours
      list = list.filter(o => {
        if (o.status !== "Raste Me Hai") return false;
        const diff = Date.now() - new Date(o.created_at).getTime();
        return diff > 2*60*60*1000;
      });
    }
    if (filter === "complaint") {
      // Cancel + delayed + Naya > 1hr
      list = list.filter(o => {
        if (o.status === "Cancel") return true;
        const diff = Date.now() - new Date(o.created_at).getTime();
        if (o.status === "Naya" && diff > 60*60*1000) return true;
        if (o.status === "Raste Me Hai" && diff > 3*60*60*1000) return true;
        return false;
      });
    }

    // Search - mobile / order_id / name / address
    if (search) {
      const q = search.toLowerCase().replace(/\s/g,"");
      list = list.filter(o => {
        const mobileMatch = o.mobile?.includes(q);
        const orderMatch = o.order_id?.toLowerCase().includes(q);
        const itemMatch = o.item_name?.toLowerCase().includes(search.toLowerCase());
        const addressMatch = o.address?.toLowerCase().includes(search.toLowerCase());
        const profile = profiles[o.mobile];
        const nameMatch = profile?.name?.toLowerCase().includes(search.toLowerCase());
        return mobileMatch || orderMatch || itemMatch || addressMatch || nameMatch;
      });
    }
    return list.slice(0, 100);
  }, [orders, search, filter, profiles]);

  const customerHistory = useMemo(() => {
    if (!selected) return [];
    return orders.filter(o => o.mobile === selected.mobile).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [selected, orders]);

  const handleStatusFix = async (id: string, newStatus: string) => {
    if (!confirm(`Order ko ${newStatus} karna hai? Customer ko turant update milega`)) return;
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    loadAll();
    if (selected?.id === id) {
      setSelected({ ...selected, status: newStatus });
    }
  };

  const copyForWhatsApp = (o: any) => {
    const seller = sellers[o.seller_id];
    const text = `*PaaniWala Support*\nOrder ID: ${o.order_id}\nCustomer: +91 ${o.mobile}\nItem: ${o.item_name} x${o.qty}\nPrice: Rs ${o.price}\nStatus: ${o.status}\nSeller: ${seller?.business_name || o.seller_id}\nAddress: ${o.address}\nOTP: ${o.delivery_otp || "N/A"}\nRemark: ${remark || "No remark"}`;
    navigator.clipboard.writeText(text);
    alert("WhatsApp ke liye copy ho gaya!");
  };

  if (!ready) return <main className="flex-1 p-6"><p className="text-center text-gray-400">Loading...</p></main>;

  return (
    <>
      <Header />
      <main className="flex-1 p-3 space-y-3 pb-24 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-blue-600 font-semibold text-sm">← Dashboard</Link>
          <h2 className="font-extrabold text-blue-900">Customer Support</h2>
          <button onClick={loadAll} className="text-xs bg-gray-100 font-bold px-3 py-1.5 rounded-xl">↻ Refresh</button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => setFilter("all")} className={`rounded-xl p-2 text-center ${filter==="all" ? "gold-btn text-white" : "bg-gray-100"}`}><p className="font-extrabold text-sm">{orders.length}</p><p className="text-[9px]">ALL</p></button>
          <button onClick={() => setFilter("today")} className={`rounded-xl p-2 text-center ${filter==="today" ? "gold-btn text-white" : "bg-blue-50 text-blue-700"}`}><p className="font-extrabold text-sm">{orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length}</p><p className="text-[9px]">TODAY</p></button>
          <button onClick={() => setFilter("delayed")} className={`rounded-xl p-2 text-center ${filter==="delayed" ? "gold-btn text-white" : "bg-amber-50 text-amber-700"}`}><p className="font-extrabold text-sm">{orders.filter(o => o.status==="Raste Me Hai" && Date.now() - new Date(o.created_at).getTime() > 2*60*60*1000).length}</p><p className="text-[9px]">DELAYED</p></button>
          <button onClick={() => setFilter("complaint")} className={`rounded-xl p-2 text-center ${filter==="complaint" ? "gold-btn text-white" : "bg-red-50 text-red-600"}`}><p className="font-extrabold text-sm">{orders.filter(o => o.status==="Cancel" || (o.status==="Naya" && Date.now() - new Date(o.created_at).getTime() > 60*60*1000)).length}</p><p className="text-[9px]">COMPLAINT</p></button>
        </div>

        {/* Search - Main */}
        <div className="gold-card rounded-2xl p-3 space-y-2">
          <label className="text-xs font-bold text-blue-900">🔍 Customer dhoondho - Mobile / Order ID / Naam / Address se</label>
          <div className="flex gap-2">
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Jaise: 98765... / PW-1234 / Ram / Arihant Anchal..."
              className="flex-1 border-2 border-amber-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-900"
              autoFocus
            />
            {search && <button onClick={() => setSearch("")} className="bg-gray-100 px-3 rounded-xl font-bold text-xs">Clear</button>}
          </div>
          <p className="text-[11px] text-gray-500">Tip: Customer ka last 4 digit mobile dalo, pura order history aa jayega</p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {/* Left - Order List */}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            <p className="font-bold text-blue-900 text-sm sticky top-0 bg-white py-1">{filtered.length} orders mile {search ? `for "${search}"` : ""}</p>
            {loading ? <p className="text-center text-gray-400 py-10">Loading...</p> : filtered.map(o => {
              const seller = sellers[o.seller_id];
              const profile = profiles[o.mobile];
              const isSelected = selected?.id === o.id;
              return (
                <button key={o.id} onClick={() => setSelected(o)} className={`w-full text-left gold-card rounded-2xl p-3 space-y-1 border-2 ${isSelected ? "border-blue-900 bg-blue-50" : "border-transparent"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-extrabold text-blue-900 text-sm">{o.order_id} <span className="font-normal text-gray-500">• {getDelay(o.created_at)}</span></p>
                      <p className="text-sm font-bold">{o.item_name} x{o.qty} - Rs {o.price}</p>
                      <p className="text-xs text-gray-600">👤 +91 {o.mobile} {profile?.name ? `(${profile.name})` : ""} | {seller?.business_name || "Unknown Seller"}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.status==="Pahuncha" ? "bg-green-100 text-green-700" : o.status==="Cancel" ? "bg-red-100 text-red-600" : o.status==="Raste Me Hai" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>{o.status || "Naya"}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">📍 {o.address}</p>
                </button>
              );
            })}
            {filtered.length===0 && <p className="text-center text-gray-400 py-10 text-sm">Koi order nahi mila - mobile ya order ID check karo</p>}
          </div>

          {/* Right - Detail & Help */}
          <div className="space-y-3">
            {!selected ? (
              <div className="gold-card rounded-2xl p-10 text-center">
                <p className="text-4xl">🎧</p>
                <p className="font-bold text-blue-900 mt-2">Kisi order pe click karo</p>
                <p className="text-xs text-gray-500 mt-1">Customer ki full detail + call + status fix yaha dikhega</p>
              </div>
            ) : (
              <>
                <div className="gold-card rounded-2xl p-4 space-y-3 border-blue-200">
                  <div className="flex justify-between">
                    <h3 className="font-extrabold text-blue-900">Order Detail - Help Panel</h3>
                    <button onClick={() => setSelected(null)} className="text-xs bg-gray-100 px-2 py-1 rounded-full">✕</button>
                  </div>

                  <div className="bg-white rounded-xl p-3 space-y-2 border">
                    <div className="flex justify-between"><span className="text-xs text-gray-500">Order ID</span><span className="font-bold text-sm">{selected.order_id}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-gray-500">Item</span><span className="font-bold text-sm">{selected.item_name} x{selected.qty}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-gray-500">Price / Commission</span><span className="font-bold text-sm">Rs {selected.price} / <span className="text-green-600">Rs {selected.commission||0}</span></span></div>
                    <div className="flex justify-between"><span className="text-xs text-gray-500">Status</span><span className={`font-bold text-sm px-2 py-0.5 rounded-full ${selected.status==="Pahuncha" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{selected.status||"Naya"}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-gray-500">Slot / Created</span><span className="font-bold text-xs">{selected.delivery_slot} • {new Date(selected.created_at).toLocaleString("en-IN")}</span></div>
                    <div><span className="text-xs text-gray-500">Address</span><p className="font-bold text-sm">{selected.address}</p></div>
                    {selected.delivery_otp && <div className="flex justify-between"><span className="text-xs text-gray-500">Delivery OTP</span><span className="font-extrabold text-green-600 tracking-widest">{selected.delivery_otp}</span></div>}
                  </div>

                  {/* Customer Profile */}
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">Customer Profile</p>
                    <p className="font-bold text-blue-900 text-sm">👤 +91 {selected.mobile} {profiles[selected.mobile]?.name ? `- ${profiles[selected.mobile].name}` : ""}</p>
                    <p className="text-xs text-gray-600">Total orders: {customerHistory.length} | Last order: {customerHistory[0] ? getDelay(customerHistory[0].created_at) : "N/A"}</p>
                    {profiles[selected.mobile]?.address && <p className="text-xs text-gray-500">Saved address: {profiles[selected.mobile].address}</p>}
                  </div>

                  {/* Seller */}
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-blue-700 uppercase">Seller</p>
                    <p className="font-bold text-blue-900 text-sm">{sellers[selected.seller_id]?.business_name || selected.seller_id}</p>
                    <p className="text-xs text-gray-600">{sellers[selected.seller_id]?.area} • +91 {sellers[selected.seller_id]?.mobile || "N/A"}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`tel:+91${selected.mobile}`} className="bg-green-600 text-white text-center font-bold py-2.5 rounded-xl text-sm">📞 Buyer Call</a>
                    <a href={`tel:+91${sellers[selected.seller_id]?.mobile || ""}`} className="bg-blue-900 text-white text-center font-bold py-2.5 rounded-xl text-sm">📞 Seller Call</a>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address||"")}`} target="_blank" className="bg-white border-2 border-blue-100 text-blue-900 text-center font-bold py-2.5 rounded-xl text-sm">📍 Map</a>
                    <button onClick={() => copyForWhatsApp(selected)} className="bg-green-50 border border-green-200 text-green-700 font-bold py-2.5 rounded-xl text-sm">📋 Copy for WhatsApp</button>
                  </div>

                  {/* Admin Fix */}
                  <div className="bg-white border-2 border-red-100 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-bold text-red-600">⚠️ Admin Quick Fix (Customer complaint pe)</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => handleStatusFix(selected.id, "Confirm")} className="bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-full text-xs">Confirm Karo</button>
                      <button onClick={() => handleStatusFix(selected.id, "Raste Me Hai")} className="bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-full text-xs">Raste Me Bhejo</button>
                      <button onClick={() => handleStatusFix(selected.id, "Pahuncha")} className="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-full text-xs">Pahuncha (Force)</button>
                      <button onClick={() => handleStatusFix(selected.id, "Cancel")} className="bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-full text-xs">Cancel</button>
                    </div>
                    <div className="flex gap-2">
                      <input value={remark} onChange={e => setRemark(e.target.value)} placeholder="Remark likho - jaise: Seller late, buyer ko 10% discount..." className="flex-1 border rounded-xl px-3 py-2 text-xs" />
                      <button onClick={() => { alert(`Remark saved: ${remark}`); setRemark(""); }} className="bg-gray-900 text-white font-bold px-4 py-2 rounded-xl text-xs">Save</button>
                    </div>
                  </div>

                  {/* Customer History */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-600 mb-2">Customer ke pichle {customerHistory.length} orders</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {customerHistory.map((o:any) => (
                        <div key={o.id} className="flex justify-between text-xs bg-white rounded-lg p-2">
                          <span>{o.order_id} - {o.item_name}</span>
                          <span className="font-bold">Rs {o.price} • {o.status||"Naya"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href={`/track/${selected.order_id}`} className="block text-center text-blue-600 font-bold text-xs py-2">Full Track Page Dekho →</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
