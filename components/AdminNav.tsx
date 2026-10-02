"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bills", label: "Bills" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settlement", label: "Settlement" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav(){
  const pathname = usePathname();
  return (
    <nav className="bg-blue-900 text-white px-3 py-2 flex gap-2 overflow-x-auto sticky top-0 z-20">
      {links.map(l=>{
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link key={l.href} href={l.href} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${active ? "bg-white text-blue-900 font-extrabold" : "bg-blue-800 text-blue-100"}`}>
            {l.label}
          </Link>
        )
      })}
    </nav>
  );
}
