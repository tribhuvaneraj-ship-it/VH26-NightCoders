import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLASHGUARD — Intelligent Adaptive Data Processing Pipeline",
  description: "Real-time intelligent pipeline demonstrating zero critical loss under 20x flash-sale traffic surge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070a12] text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}