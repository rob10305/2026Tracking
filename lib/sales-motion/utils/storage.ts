import type { AppState, MultiUserState, UserId } from '../types';
import { USERS } from '../types';
import { createSeedData } from '../data/seedData';

const STORAGE_KEY_V1 = 'sales-motion-tracker-v1';
const STORAGE_KEY = 'sales-motion-tracker-v2';

function loadV1State(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.reportingMonth && !data.reportingMonths) {
      data.reportingMonths = [data.reportingMonth];
      delete data.reportingMonth;
    }
    return data as AppState;
  } catch {
    return null;
  }
}

export function createFreshMultiUserState(): MultiUserState {
  const users = {} as Record<UserId, AppState>;
  for (const u of USERS) {
    users[u.id] = createSeedData();
  }
  return {
    version: 2,
    activeUser: 'jaime',
    viewAll: true,
    users,
    sharedMotionLibrary: [],
  };
}

export function loadMultiUserState(): MultiUserState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MultiUserState;

    const v1 = loadV1State();
    if (v1) {
      const fresh = createFreshMultiUserState();
      fresh.users.jaime = v1;
      const defaultNames = new Set(createSeedData().motions.map((m) => m.name));
      for (const motion of v1.motions) {
        if (!defaultNames.has(motion.name)) {
          fresh.sharedMotionLibrary.push({ name: motion.name, color: motion.color, createdBy: 'jaime' });
        }
      }
      localStorage.removeItem(STORAGE_KEY_V1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveMultiUserState(state: MultiUserState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY_V1);
}
