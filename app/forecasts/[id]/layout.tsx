"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ForecastProvider, useForecast } from "@/lib/store/forecast-context";

const TABS = [
  { href: "", label: "Grid" },
  { href: "/charts", label: "Charts" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/settings", label: "Settings" },
];

function ForecastHeader() {
  const { forecast, isLoading } = useForecast();
  if (isLoading || !forecast) return null;
  return (
    <div className="mb-1">
      <h1 className="text-lg font-bold">{forecast.name}</h1>
      {forecast.description && (
        <p className="text-sm text-gray-500">{forecast.description}</p>
      )}
    </div>
  );
}

function ForecastTabs() {
  const pathname = usePathname();
  const params = useParams();
  const id = params.id as string;
  const base = `/forecasts/${id}`;

  return (
    <div className="flex gap-1 border-b border-gray-200 mb-4">
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const active =
          tab.href === ""
            ? pathname === base || pathname === `${base}/grid`
            : pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={tab.href === "" ? `${base}` : href}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              active
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function ForecastDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;

  return (
    <ForecastProvider forecastId={id}>
      <div className="max-w-6xl mx-auto">
        <ForecastHeader />
        <ForecastTabs />
        {children}
      </div>
    </ForecastProvider>
  );
}
