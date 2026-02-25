"use client";

import React, { useState, useEffect } from "react";

const SETTINGS_PASSWORD = "itmethods";
const STORAGE_KEY = "settings-unlocked";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === SETTINGS_PASSWORD) {
      setUnlocked(true);
      setError(false);
      sessionStorage.setItem(STORAGE_KEY, "true");
    } else {
      setError(true);
      setInput("");
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 w-full max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-center text-gray-800 mb-1">Settings Protected</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Enter the password to access settings.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(false);
                }}
                placeholder="Password"
                autoFocus
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
              />
              {error && (
                <p className="text-xs text-red-500 mt-1.5">Incorrect password. Please try again.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Unlock Settings
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
