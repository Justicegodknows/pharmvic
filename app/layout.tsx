import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { ChatWidget } from "@/app/components/chat-widget";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const manrope = Manrope({ subsets: ['latin'], variable: '--font-headline', weight: ['700', '800'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PharmConnect — Nigeria-Germany Pharma B2B Platform",
  description: "Connecting Nigerian pharmaceutical vendors with verified German manufacturers. Discover suppliers, understand NAFDAC requirements, and initiate trade relationships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, manrope.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
