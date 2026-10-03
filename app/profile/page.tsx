"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getMobile } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Profile(){
  const router = useRouter();
  const [m,setM]=useState<string|null>(null);
  const [p,setP]=useState<any>(null);
  const [lastOrderId,setLastOrderId]=useState<string>("");
  const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState(false);
  const [editName,setEditName]=useState("");
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    const mobile = getMobile();
    setM(mobile);
    setLastOrderId(localStorage.getItem("pw_last_order") || "");
    if(mobile){
      supabase.from("profiles").select("*").eq("mobile",mobile).maybeSingle()
       .then(({data})=>{
          setP(data);
          setLoading(false);
          if(data) setEditName(data.name || "");
        });
    } else setLoading(false);
  },[]);

  const saveName = async () => {
    if(!m) return;
    if(!editName.trim()){ alert("Naam dalo"); return; }
    setSaving(true);
    const {error} = await supabase.from("profiles").update({name: editName.trim()}).eq("mobile", m);
    setSaving(false);
    if(error) alert(error.message);
    else { setP({...p, name: editName.trim()}); setEditing(false); }
  };

  const logout=()=>{
    localStorage.removeItem("pw_mobile");
    localStorage.removeItem("pw_last_order");
    router.push("/login");
  };

  if(loading) return <><Header /><main className="flex-1 p-6 text-center text-gray-400">Loading...</main><BottomNav /></>;
  if(!m) return <><Header /><main className="p-6 text-center space-y-3"><p>Login nahi kiya</p><Link href="/login" className="gold-btn px-6 py-2 rounded-xl text-white">Login Karo</Link></main><BottomNav /></>;

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 pb-24">
        <h2 className="text-xl font-extrabold text-blue-900">Meri Profile</h2>
        <div className="gold-card rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-extrabold text-blue-900 text-lg">{p?.name || "Customer"}</p>
              <p className="text-sm text-gray-500">+91 {m}</p>
              <p className="text-sm text-gray-600 mt-1">{p?.address || "Pehla order karo - GPS auto save hoga"}</p>
              {p?.lat && p?.lng && (
                <p className="text-[11px] text-green-700 bg-green-50 border rounded-lg px-2 py-1 mt-2 inline-block">
                  📍 Last: {Number(p.lat).toFixed(4)}, {Number(p.lng).toFixed(4)}
                </p>
              )}
            </div>
            <button onClick={()=>setEditing(!editing)} className="text-xs font-bold text-blue-600 border border-blue-200 rounded-xl px-3 py-1.5">
              {editing?"Cancel":"Edit"}
            </button>
          </div>
          {editing && (
            <div className="border-t pt-3 space-y-2">
              <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Aapka Naam" className="w-full border-2 border-amber-400 rounded-xl px-3 py-2.5 text-sm font-bold" />
              <button onClick={saveName} disabled={saving} className="w-full gold-btn text-white font-bold py-2.5 rounded-xl">{saving?"Save...":"Naam Save Karo"}</button>
            </div>
          )}
        </div>

        <Link href="/orders" className="border-2 bg-white rounded-2xl p-4 flex gap-3 items-center"><span>🚚</span><span className="flex-1 font-semibold text-sm">Mere Orders</span><span>›</span></Link>
        {lastOrderId && <Link href={"/track/"+lastOrderId} className="border-2 border-blue-100 bg-blue-50 rounded-2xl p-4 flex gap-3"><span>📍</span><span className="flex-1 font-semibold text-sm text-blue-900">Last Order Track - {lastOrderId}</span><span>›</span></Link>}
        <p className="text-[11px] text-gray-400 text-center">Har order pe current location auto li jayegi</p>
        <button onClick={logout} className="border-2 border-red-100 bg-red-50 w-full rounded-2xl p-4 flex gap-3"><span>🚪</span><span className="flex-1 font-semibold text-red-600 text-left text-sm">Logout</span><span>›</span></button>
      </main>
      <BottomNav />
    </>
  )
}
