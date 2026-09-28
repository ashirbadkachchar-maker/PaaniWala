import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import ProfileCard from "@/components/ProfileCard";

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

        <ProfileCard />

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
