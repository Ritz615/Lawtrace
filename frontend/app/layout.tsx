import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LexAI – Enterprise AI Contract Management",
    template: "%s | LexAI",
  },
  description:
    "AI-powered enterprise contract lifecycle management platform. Upload, analyze, generate, and manage legal contracts with cutting-edge AI.",
  keywords: ["contract management", "AI legal", "CLM", "contract analysis", "LexAI"],
  authors: [{ name: "LexAI Team" }],
  openGraph: {
    title: "LexAI – Enterprise AI Contract Management",
    description: "AI-powered contract lifecycle management platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
