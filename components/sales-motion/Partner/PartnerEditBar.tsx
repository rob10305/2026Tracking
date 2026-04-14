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
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 rounded-lg">
            <Pencil size={11} /> Editing
          </span>
          <button
            onClick={onLock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <Lock size={12} /> Lock
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 rounded-lg">
            <Eye size={11} /> Read-only
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Unlock size={12} /> Unlock to Edit
          </button>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setShowModal(false); setPassword(''); setError(false); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Lock size={18} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">Unlock Editing</h3>
                <p className="text-xs text-gray-500">Enter the admin password to edit partner details.</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setPassword(''); setError(false); }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Admin password"
                autoFocus
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {error && <p className="text-xs text-red-500">Incorrect password. Please try again.</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setPassword(''); setError(false); }}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
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
