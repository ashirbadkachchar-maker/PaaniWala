import "./globals.css";
import type { Metadata } from "next";
import PWA from "@/components/PWA";

export const metadata: Metadata = {
  title: "PaaniWala - Ghar Ghar Shuddh Paani",
  description: "Jodhpur me sabse tez paani delivery - Camper, Tanker, 20L Bottle",
  themeColor: "#1e3a8a",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body className="min-h-screen bg-[#fff7ed]">
        <PWA />
        {children}
      </body>
    </html>
  );
}
