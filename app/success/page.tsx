"use client";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
export default function Success(){
  const oid = typeof window!=="undefined" ? localStorage.getItem("pw_last_order") : "PW-7998";
  return (<><Header />
  <main className="flex-1 p-6 text-center space-y-4">
    <h2 className="text-2xl font-bold text-blue-900">Order Successful! {oid}</h2>
    <p>Paani wala raste me hai</p>
    <Link href="/home" className="gold-btn block text-white py-3 rounded-2xl">Aur Order Karo</Link>
    <Link href="/orders" className="block border-2 py-3 rounded-2xl font-bold">Mere Orders Dekho</Link>
  </main><BottomNav /></>)
}
