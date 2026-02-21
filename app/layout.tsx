import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata: Metadata = {
  title: "ウェル活マスター Pro",
  description: "ウェル活専用の予算管理・在庫チェックアプリ",
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
