import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "700", "800"] });

export const metadata: Metadata = {
  title: "AI Business Discovery Studio",
  description: "The Executive AI Transformation Assessment",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${body.variable} font-body text-scan-text antialiased`}>{children}</body>
    </html>
  );
}
