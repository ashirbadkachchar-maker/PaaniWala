import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-900">Namaste, Ramesh 👋</h2>
        <input className="input-gold" placeholder="Paani search karo..." />
        <div className="gold-btn rounded-2xl p-4 text-white font-bold">
          PAANI20 - Pehle order par 20% chhoot
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/camper" className="gold-card rounded-2xl p-4 text-center">
            <div className="text-5xl">🫙</div>
            <p className="font-bold text-blue-900 mt-2">Camper Order Karo</p>
            <p className="text-sm text-gray-500">Rs 40/can</p>
          </Link>
          <Link href="/tanker" className="gold-card rounded-2xl p-4 text-center">
            <div className="text-5xl">🚛</div>
            <p className="font-bold text-blue-900 mt-2">Tanker Book Karo</p>
            <p className="text-sm text-gray-500">Rs 1200 se</p>
          </Link>
        </div>
        <div className="border-2 border-gray-200 rounded-2xl p-4">
          <h3 className="font-bold text-blue-900">Chal Rahe Orders</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm">🚚 2 Camper - Aaj Subah 8 Baje</span>
            <Link href="/track" className="gold-btn text-white text-sm font-bold px-4 py-2 rounded-full">
              Track Karo
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
