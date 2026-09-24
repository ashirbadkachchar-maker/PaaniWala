import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function Success() {
  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full gold-btn flex items-center justify-center text-5xl text-white">✓</div>
        <h2 className="text-2xl font-extrabold text-blue-900">Order Mil Gaya!</h2>
        <p className="text-gray-500">Dhanyavaad Ramesh Ji 🎉</p>

        <div className="gold-card rounded-2xl p-4 w-full text-left text-sm space-y-1">
          <div className="flex justify-between"><span>Order ID</span><span className="font-bold">PW-4821</span></div>
          <div className="flex justify-between"><span>Items</span><span>2 Camper - 20L</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>Aaj Subah 8 Baje</span></div>
          <div className="flex justify-between font-extrabold text-blue-900 pt-1 border-t"><span>Kul Bhugtan</span><span>Rs 64</span></div>
        </div>

        <Link href="/track" className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl">Track Karo</Link>
        <Link href="/home" className="w-full border-2 border-blue-900 text-blue-900 font-bold py-3 rounded-2xl">Home Jao</Link>
      </main>
      <BottomNav />
    </>
  );
}
