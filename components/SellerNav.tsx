"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/seller/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/seller/orders", label: "Orders", icon: "🚚" },
  { href: "/seller/products", label: "Products", icon: "📦" },
];

export default function SellerNav() {
  const path = usePathname();
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("pw_seller_id");
    router.push("/seller");
  };
  return (
    <div className="bg-blue-900 text-white sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-extrabold text-lg">Seller Panel</span>
        <button onClick={logout} className="text-xs bg-red-500 px-3 py-1.5 rounded-full font-bold">Logout</button>
      </div>
      <nav className="grid grid-cols-3 text-center text-xs">
        {items.map((it) => (
          <Link key={it.href} href={it.href}
            className={"py-2 " + (path === it.href ? "bg-amber-500 text-blue-900 font-bold" : "text-amber-100")}>
            <div className="text-xl">{it.icon}</div>{it.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
