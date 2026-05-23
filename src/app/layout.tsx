import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "ieee cs muj",
  description: "ieee cs muj website",
};

import Preloader from "@/components/common/Preloader";
import { LoadingProvider } from "@/context/LoadingContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <LoadingProvider>
          <Preloader />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </LoadingProvider>
      </body>
    </html>
  );
}