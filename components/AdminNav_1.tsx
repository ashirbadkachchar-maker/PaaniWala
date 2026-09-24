"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "\U0001F4CA" },
  { href: "/admin/orders", label: "Orders", icon: "\U0001F69A" },
  { href: "/admin/bills", label: "Bills", icon: "\U0001F9FE" },
  { href: "/admin/customers", label: "Customers", icon: "\U0001F465" },
];

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("pw_admin");
    router.push("/admin");
  };
  return (
    <div className="bg-blue-900 text-white sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-extrabold text-lg">PaaniWala Admin</span>
        <button onClick={logout} className="text-xs bg-red-500 px-3 py-1.5 rounded-full font-bold">
          Logout
        </button>
      </div>
      <nav className="grid grid-cols-4 text-center text-xs">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`py-2 ${path === it.href ? "bg-amber-500 text-blue-900 font-bold" : "text-amber-100"}`}
          >
            <div className="text-xl">{it.icon}</div>
            {it.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
