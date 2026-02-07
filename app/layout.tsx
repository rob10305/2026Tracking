import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store/context";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "FY2026 Sales Forecast",
  description: "Bottoms-up sales forecast tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <StoreProvider>
          <Navigation />
          <main className="p-4">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
