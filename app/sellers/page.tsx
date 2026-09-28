"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getBuyerProfile, areaMatches } from "@/lib/supabase";

type Seller = { id: string; business_name: string; area: string | null; address: string | null };

function SellerCard({ s }: { s: Seller }) {
  return (
    <div className="gold-card rounded-2xl p-4">
      <p className="font-extrabold text-blue-900 text-lg">{s.business_name}</p>
      <p className="text-sm text-gray-500">{s.area || ""} {s.address ? "- " + s.address : ""}</p>
      <Link href={"/shop/" + s.id} className="gold-btn block text-center text-white font-bold py-2.5 rounded-2xl mt-3">
        Dukkan Kholo
      </Link>
    </div>
  );
}

export default function Sellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      const [profile, { data }] = await Promise.all([
        getBuyerProfile(),
        supabase.from("sellers").select("id,business_name,area,address").eq("status", "approved"),
      ]);
      setAddress(profile?.address || null);
      if (data) setSellers(data);
      setLoading(false);
    })();
  }, []);

  const nearby = sellers.filter((s) => areaMatches(address, s.area));
  const others = sellers.filter((s) => !areaMatches(address, s.area));

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-3">
        <h2 className="text-xl font-bold text-blue-900">Sellers Dekho</h2>

        <div className="border-2 border-gray-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <p className="text-gray-500">Delivery pata</p>
            <p className="font-semibold text-blue-900 truncate">{address || "Abhi pata nahi jodha"}</p>
          </div>
          <Link href="/address" className="text-blue-600 font-semibold shrink-0">
            {address ? "Badlo" : "Pata Jodo"}
          </Link>
        </div>

        {loading && <p className="text-gray-400 text-sm text-center">Load ho raha hai...</p>}

        {!loading && (
          <>
            <section className="space-y-3" aria-labelledby="nearby-heading">
              <h3 id="nearby-heading" className="font-bold text-blue-900">Aapke area ke sellers</h3>
              {nearby.map((s) => <SellerCard key={s.id} s={s} />)}
              {nearby.length === 0 && (
                <p className="text-gray-400 text-sm">
                  {address
                    ? "Aapke area mein abhi koi seller nahi hai."
                    : "Apna pata jodo taaki aapke area ke sellers dikh sakein."}
                </p>
              )}
            </section>

            {others.length > 0 && (
              <section className="space-y-3 pt-2" aria-labelledby="others-heading">
                <button
                  id="others-heading"
                  onClick={() => setShowAll(!showAll)}
                  aria-expanded={showAll}
                  className="w-full border-2 border-blue-500 text-blue-600 font-semibold py-2 rounded-full text-sm"
                >
                  {showAll ? "Doosre area ke sellers chhupao" : "Doosre area ke sellers dekho (" + others.length + ")"}
                </button>
                {showAll && others.map((s) => <SellerCard key={s.id} s={s} />)}
              </section>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}
