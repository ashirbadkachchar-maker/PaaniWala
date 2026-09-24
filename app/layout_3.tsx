import "./globals.css";
import type { Metadata, Viewport } from "next";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "PaaniWala - Ghar Ghar Shuddh Paani",
  description: "PaaniWala water delivery app",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "PaaniWala", statusBarStyle: "default" },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>
        <PwaRegister />
        <div className="max-w-md mx-auto min-h-screen bg-white gold-frame flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
