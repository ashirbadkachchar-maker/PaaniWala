import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PaaniWala - Ghar Ghar Shuddh Paani",
  description: "PaaniWala water delivery app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>
        <div className="max-w-md mx-auto min-h-screen bg-white gold-frame flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
