import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/lib/context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpecFast — Idea to Spec in Minutes",
  description: "Transform your project idea into a structured spec optimized for AI coding tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-[#fafafa] antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
