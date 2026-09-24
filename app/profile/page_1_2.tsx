import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Image from "next/image";
import Link from "next/link";

const menu = [
  { icon: "🚚", label: "Mere Orders", href: "/track" },
  { icon: "📍", label: "Address Book", href: "/address" },
  { icon: "💳", label: "Payment Methods", href: "/bills" },
  { icon: "🎧", label: "Madad / Support", href: "/profile" },
  { icon: "🎁", label: "Doston Ko Batao", href: "/profile" },
];

export default function Profile() {
  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">← Meri Profile</h2>

        <div className="gold-card rounded-2xl p-4 flex items-center gap-4">
          <Image src="/pagdi.png" alt="profile" width={64} height={64} className="object-contain rounded-full bg-amber-50 p-1" />
          <div className="flex-1">
            <p className="font-extrabold text-blue-900 text-lg">Ramesh Ji</p>
            <p className="text-sm text-gray-500">+91 98765 43210</p>
            <p className="text-sm text-gray-500">B-2-304, Arihant Anchal, Jodhpur</p>
          </div>
          <Link href="/address" className="text-amber-600 text-sm font-bold">Edit Karo</Link>
        </div>

        <div className="space-y-2">
          {menu.map((m) => (
            <Link key={m.label} href={m.href} className="border-2 border-gray-200 rounded-2xl p-3 flex items-center gap-3">
              <span className="text-2xl">{m.icon}</span>
              <span className="flex-1 font-semibold text-blue-900">{m.label}</span>
              <span className="text-gray-400">›</span>
            </Link>
          ))}
          <Link href="/login" className="border-2 border-red-200 rounded-2xl p-3 flex items-center gap-3">
            <span className="text-2xl">🚪</span>
            <span className="flex-1 font-semibold text-red-600">Logout</span>
            <span className="text-gray-400">›</span>
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400">PaaniWala v1.0</p>
      </main>
      <BottomNav />
    </>
  );
}
