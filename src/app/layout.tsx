import type { Metadata } from "next";
import "./globals.css";
import ShellLayout from "@/components/layout/ShellLayout";

export const metadata: Metadata = {
  title: "MineGuard | Multi-Hazard Smart Underground Monitoring Dashboard",
  description:
    "AI-based multi-hazard smart safety jacket and underground mine telemetry dashboard for Smart India Hackathon (SIH). Sense. Connect. Protect.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#F7F3EC] text-[#0F172A] font-sans">
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}
