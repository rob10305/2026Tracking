'use client';

import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { USERS } from '@/lib/sales-motion/types';

export function SMUserSwitcher() {
  const { activeUser, viewAll, dispatch } = useTracker();

  return (
    <div className="flex items-center gap-1 px-6 py-2 bg-white border-b border-gray-200">
      <span className="text-xs text-gray-500 mr-2 font-medium">Sales Rep:</span>
      <button
        onClick={() => dispatch({ type: 'SET_VIEW_ALL' })}
        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
          viewAll ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      {USERS.map((u) => (
        <button
          key={u.id}
          onClick={() => dispatch({ type: 'SWITCH_USER', userId: u.id })}
          className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
            !viewAll && activeUser === u.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {u.displayName}
        </button>
      ))}
    </div>
  );
}
