import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title:
    "Aytipanel — Panel Pendingin, Cold Storage & Cooling System | PT Nusantara Pendingin Sejahtera",
  description:
    "Produksi sandwich panel, instalasi cold room & sistem refrigerasi industri. Mitra teknik PT Nusantara Pendingin Sejahtera.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth bg-background antialiased`}
    >
      <body className="flex min-h-[100dvh] flex-col overflow-x-clip bg-background text-foreground">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
