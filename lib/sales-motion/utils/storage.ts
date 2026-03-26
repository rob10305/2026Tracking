import type { AppState, MultiUserState, UserId, Category } from '../types';
import { USERS } from '../types';
import { createSeedData } from '../data/seedData';

const EVENTS_CATEGORY_NAME = 'Events/In Person';

function makeEventsCategory(): Category {
  return {
    id: crypto.randomUUID(),
    name: EVENTS_CATEGORY_NAME,
    tasks: [],
    assignedTo: '',
    status: 'Not Started',
    priority: 'Medium',
    dueDate: '',
    completedDate: '',
    target: '',
    rag: '' as import('../types').RAG,
    notes: '',
  };
}

function migrateAddEventsCategory(state: MultiUserState): MultiUserState {
  const newUsers = { ...state.users };
  for (const userId of Object.keys(newUsers) as UserId[]) {
    const userState = newUsers[userId];
    const newMotions = userState.motions.map((motion) => {
      if (motion.categories.some((c) => c.name === EVENTS_CATEGORY_NAME)) return motion;
      return { ...motion, categories: [makeEventsCategory(), ...motion.categories] };
    });
    newUsers[userId] = { ...userState, motions: newMotions };
  }
  return { ...state, users: newUsers };
}

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
    if (raw) {
      const parsed = JSON.parse(raw) as MultiUserState;
      const migrated = migrateAddEventsCategory(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

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
