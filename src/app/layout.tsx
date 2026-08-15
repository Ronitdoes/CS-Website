import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, DM_Sans, Cormorant_Garamond, Share_Tech_Mono, VT323, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["700"],
  style: ["italic"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: ["400"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "IEEE CS MUJ",
  description: "ieee cs muj website",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logos/ieee-cs-logo.avif", type: "image/avif" },
    ],
    apple: [
      { url: "/logos/ieee-cs-logo.avif", type: "image/avif" },
    ],
  },
};

import Preloader from "@/components/common/Preloader";
import { LoadingProvider } from "@/context/LoadingContext";
import ScrollProvider from "@/components/providers/ScrollProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} ${dmSans.variable} ${cormorant.variable} ${shareTechMono.variable} ${vt323.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <ScrollProvider>
          <LoadingProvider>
            <Preloader />
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </LoadingProvider>
        </ScrollProvider>
      </body>
    </html>
  );
}