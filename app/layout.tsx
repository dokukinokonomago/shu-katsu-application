import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Memory Ending App",
  description: "A local-first life memory and end-of-life planning app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

