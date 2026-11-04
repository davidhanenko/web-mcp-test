import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { CartDrawer } from "@/app/components/CartDrawer";
import { SavedCartLoader } from "@/app/components/SavedCartLoader";
import { Footer } from "@/app/components/Footer";
import { Header } from "@/app/components/Header";
import { ToastRegion } from "@/app/components/ToastRegion";
import { WebMcpTools } from "@/app/components/WebMcpTools";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Northline Supply",
  description: "Outdoor clothing for wet ridgelines and quiet camps.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SavedCartLoader />
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 lg:px-8">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <ToastRegion />
        <WebMcpTools />
      </body>
    </html>
  );
}
