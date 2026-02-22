import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata: Metadata = {
  title: "星家在庫管理",
  description: "星家の在庫をスマートに管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${noto.className} bg-slate-50 text-slate-800 antialiased`}>
        <div className="min-h-screen max-w-md mx-auto flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
