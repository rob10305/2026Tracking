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

// Accent per user — mapped to AOP/AI Showcase palette
const TEAM_DOT: Record<UserId, string> = {
  jaime:   'bg-accent-emerald',
  danielg: 'bg-accent-emerald',
  mike:    'bg-accent-sky',
  shane:   'bg-accent-sky',
  danielr: 'bg-accent-violet',
};

const TEAM_RING: Record<UserId, string> = {
  jaime:   'ring-accent-emerald',
  danielg: 'ring-accent-emerald',
  mike:    'ring-accent-sky',
  shane:   'ring-accent-sky',
  danielr: 'ring-accent-violet',
};

export function SMUserSwitcher() {
  const { activeUser, viewAll, dispatch } = useTracker();
  const router = useRouter();

  const handleSwitchUser = (userId: UserId) => {
    dispatch({ type: 'SWITCH_USER', userId });
    router.push('/sales-motion/dashboard');
  };

  const handleViewAll = () => {
    dispatch({ type: 'SET_VIEW_ALL' });
    router.push('/sales-motion');
  };

  return (
    <div className="flex items-center gap-2 px-6 py-2.5 bg-canvas-raised border-b border-white/5 flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mr-1">
        Sales Rep
      </span>

      <button
        onClick={handleViewAll}
        className={`px-3 py-1.5 text-[12px] rounded-md font-semibold transition-colors border ${
          viewAll
            ? 'bg-accent-sky/15 text-accent-sky border-accent-sky/30'
            : 'bg-white/[0.02] text-gray-400 border-white/5 hover:bg-white/[0.06] hover:text-white'
        }`}
      >
        All
      </button>

      <span className="w-px h-6 bg-white/10" />

      {USERS.map((u) => {
        const isActive = !viewAll && activeUser === u.id;
        const photo = AVATAR[u.id];
        return (
          <button
            key={u.id}
            onClick={() => handleSwitchUser(u.id)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              isActive
                ? 'bg-white/[0.06] text-white border-white/10'
                : 'bg-white/[0.02] text-gray-400 border-white/5 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <span className={`relative inline-flex ${isActive ? `ring-2 ring-offset-0 ${TEAM_RING[u.id]} rounded-full` : ''}`}>
              <Image
                src={photo}
                alt={u.displayName}
                width={20}
                height={20}
                className="rounded-full object-cover flex-shrink-0"
              />
            </span>
            {u.displayName}
            <span className={`h-1.5 w-1.5 rounded-full ${TEAM_DOT[u.id]} ${isActive ? 'opacity-100' : 'opacity-50'}`} />
          </button>
        );
      })}
    </div>
  );
}
