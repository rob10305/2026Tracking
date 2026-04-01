'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { USERS } from '@/lib/sales-motion/types';
import type { UserId } from '@/lib/sales-motion/types';

const AVATAR: Record<UserId, string> = {
  jaime:   '/avatars/jaime.jpeg',
  danielg: '/avatars/danielr-cs.jpeg',
  mike:    '/avatars/mike.jpeg',
  shane:   '/avatars/shane.jpeg',
  danielr: '/avatars/danielr-partner.jpeg',
};

const TEAM_COLOR: Record<UserId, string> = {
  jaime:   'bg-teal-50 text-teal-800 border border-teal-200',
  danielg: 'bg-teal-50 text-teal-800 border border-teal-200',
  mike:    'bg-blue-50 text-blue-800 border border-blue-200',
  shane:   'bg-blue-50 text-blue-800 border border-blue-200',
  danielr: 'bg-purple-50 text-purple-800 border border-purple-200',
};

const TEAM_COLOR_ACTIVE: Record<UserId, string> = {
  jaime:   'bg-teal-600 text-white border border-teal-600',
  danielg: 'bg-teal-600 text-white border border-teal-600',
  mike:    'bg-blue-600 text-white border border-blue-600',
  shane:   'bg-blue-600 text-white border border-blue-600',
  danielr: 'bg-purple-600 text-white border border-purple-600',
};

export function SMUserSwitcher() {
  const { activeUser, viewAll, dispatch } = useTracker();
  const router = useRouter();

  const handleSwitchUser = (userId: UserId) => {
    dispatch({ type: 'SWITCH_USER', userId });
    router.push('/sales-motion');
  };

  const handleViewAll = () => {
    dispatch({ type: 'SET_VIEW_ALL' });
    router.push('/sales-motion');
  };

  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-white border-b border-gray-200 flex-wrap">
      <span className="text-xs text-gray-500 font-medium mr-1">Sales Rep:</span>

      <button
        onClick={handleViewAll}
        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors border ${
          viewAll
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
        }`}
      >
        All
      </button>

      <span className="w-px h-6 bg-gray-200" />

      {USERS.map((u) => {
        const isActive = !viewAll && activeUser === u.id;
        const photo = AVATAR[u.id];
        return (
          <button
            key={u.id}
            onClick={() => handleSwitchUser(u.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive ? TEAM_COLOR_ACTIVE[u.id] : TEAM_COLOR[u.id] + ' hover:opacity-80'
            }`}
          >
            <Image
              src={photo}
              alt={u.displayName}
              width={20}
              height={20}
              className="rounded-full object-cover flex-shrink-0"
            />
            {u.displayName}
          </button>
        );
      })}
    </div>
  );
}
