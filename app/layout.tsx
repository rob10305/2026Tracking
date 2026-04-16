import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store/context";
import { SavedForecastsProvider } from "@/lib/store/saved-forecasts-context";
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
      <body className="bg-[#050914] text-gray-100 min-h-screen">
        <StoreProvider>
          <SavedForecastsProvider>
            <Navigation />
            <main className="p-4">{children}</main>
          </SavedForecastsProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
