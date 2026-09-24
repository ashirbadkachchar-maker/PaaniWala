import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b-2 border-amber-200 sticky top-0 z-10">
      <Link href="/home" className="flex items-center gap-2">
        <Image src="/pagdi.png" alt="PaaniWala" width={42} height={42} className="object-contain" />
        <span className="text-2xl font-extrabold text-blue-900">PaaniWala</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-blue-900">📍 Jodhpur</span>
        <span className="relative text-xl">
          🔔
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </span>
      </div>
    </header>
  );
}
