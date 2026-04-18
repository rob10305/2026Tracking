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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="font-sans min-h-screen antialiased bg-canvas text-gray-100">
        <StoreProvider>
          <SavedForecastsProvider>
            <Navigation />
            <main className="p-4 anim-fade-in">{children}</main>
          </SavedForecastsProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
