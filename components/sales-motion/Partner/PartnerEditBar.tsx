'use client';

import { useState } from 'react';
import { Lock, Unlock, Eye, Pencil, X } from 'lucide-react';

interface PartnerEditBarProps {
  unlocked: boolean;
  onUnlock: (password: string) => boolean;
  onLock: () => void;
}

export function PartnerEditBar({ unlocked, onUnlock, onLock }: PartnerEditBarProps) {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUnlock(password)) {
      setShowModal(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <>
      {unlocked ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] bg-accent-amber/10 text-accent-amber border border-accent-amber/30 rounded-md">
            <Pencil size={11} /> Editing
          </span>
          <button
            onClick={onLock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-white/10 bg-white/[0.03] rounded-md hover:bg-white/[0.06] text-gray-300 hover:text-white transition-colors"
          >
            <Lock size={12} /> Lock
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] bg-white/5 text-gray-400 border border-white/10 rounded-md">
            <Eye size={11} /> Read-only
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-accent-violet text-[#050914] rounded-md hover:brightness-110 transition"
          >
            <Unlock size={12} /> Unlock to Edit
          </button>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false);
            setPassword('');
            setError(false);
          }}
        >
          <div
            className="bg-canvas-raised border border-white/10 rounded-xl shadow-soft-dark-lg w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center">
                <Lock size={18} className="text-accent-violet" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">Unlock Editing</h3>
                <p className="text-xs text-gray-400">
                  Enter the admin password to edit partner details.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setPassword('');
                  setError(false);
                }}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Admin password"
                autoFocus
                className={`w-full px-3 py-2.5 text-sm bg-canvas text-white placeholder-gray-500 border rounded-md focus:outline-none transition-colors ${
                  error
                    ? 'border-accent-rose/50 bg-accent-rose/10'
                    : 'border-white/10 focus:border-accent-violet/50'
                }`}
              />
              {error && (
                <p className="text-xs text-accent-rose">Incorrect password. Please try again.</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPassword('');
                    setError(false);
                  }}
                  className="flex-1 px-3 py-2.5 text-sm font-semibold text-gray-300 bg-white/[0.03] border border-white/10 rounded-md hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2.5 text-sm font-semibold text-[#050914] bg-accent-violet rounded-md hover:brightness-110 transition"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
