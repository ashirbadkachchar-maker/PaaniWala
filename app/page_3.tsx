"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Splash() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.push("/home"), 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
      <div className="text-2xl">💧</div>
      <Image src="/pagdi.png" alt="PaaniWala logo" width={160} height={160} className="object-contain" />
      <h1 className="text-4xl font-extrabold text-blue-900">PaaniWala</h1>
      <p className="text-amber-600 font-semibold text-lg">Ghar Ghar Shuddh Paani</p>
      <div className="text-2xl">💧</div>
      <div className="w-44 h-2 bg-amber-100 rounded-full overflow-hidden mt-4">
        <div className="h-full w-2/3 gold-btn rounded-full" />
      </div>
      <p className="text-xs text-gray-400">v1.0</p>
    </div>
  );
}
