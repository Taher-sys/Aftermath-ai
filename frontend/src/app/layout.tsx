import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopNav } from "@/components/navigation/top-nav";

export const metadata: Metadata = {
  title: "AFTERMATH — AI-Powered Commitment & Consequence Simulator",
  description:
    "An evidence-backed commitment and consequence exploration system. Explore what happens before you sign.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#EFECE1] text-[#141414] antialiased overflow-hidden flex h-screen relative select-none">
        {/* Global Minimal Utility Sidebar Dock */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <TopNav />
          <main className="flex-1 overflow-y-auto bg-[#EFECE1] relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
