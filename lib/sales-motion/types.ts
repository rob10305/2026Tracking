export type Status = 'Not Started' | 'In Progress' | 'Complete' | 'Blocked' | 'At Risk';
export type Priority = 'High' | 'Medium' | 'Low';
export type RAG = '🟢 On Track' | '🟡 At Risk' | '🔴 Off Track' | '';

export interface Task {
  id: string;
  activityText: string;
  assignedTo: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  completedDate: string;
  keyDependency: string;
  dependencyStatus: Status;
  kpiMetric: string;
  target: string;
  actual: string;
  rag: RAG;
  notes: string;
  parentTaskId?: string;
  isOverridden?: boolean;
}

export interface Category {
  id: string;
  name: string;
  assignedTo: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  completedDate: string;
  target: string;
  rag: RAG;
  notes: string;
  tasks: Task[];
  parentCategoryId?: string;
}

export interface KPIRow {
  id: string;
  metric: string;
  annualTarget: string;
  monthly: Record<string, string>;
}

export interface Motion {
  id: string;
  name: string;
  type: string;
  description: string;
  color: string;
  owner: string;
  reportingMonth: string;
  focusNote: string;
  ragStatus: RAG;
  contributionGoal: string;
  actual: string;
  leads: string;
  wins: string;
  categories: Category[];
  kpiRows: KPIRow[];
  parentMotionId?: string;
  parentUserId?: string;
  locked?: boolean;
}

export interface AppState {
  reportingMonths: string[];
  motions: Motion[];
}

export type UserId = 'jaime' | 'danielg' | 'mike' | 'shane' | 'danielr';

export interface UserProfile {
  id: UserId;
  displayName: string;
}

export const USERS: UserProfile[] = [
  { id: 'jaime', displayName: 'Jaime' },
  { id: 'danielg', displayName: 'Daniel G' },
  { id: 'mike', displayName: 'Mike' },
  { id: 'shane', displayName: 'Shane' },
  { id: 'danielr', displayName: 'Daniel R' },
];

export interface SharedMotionEntry {
  name: string;
  color: string;
  createdBy: UserId;
}

export interface MultiUserState {
  version: 2;
  activeUser: UserId;
  viewAll: boolean;
  users: Record<UserId, AppState>;
  sharedMotionLibrary: SharedMotionEntry[];
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const STATUS_OPTIONS: Status[] = ['Not Started', 'In Progress', 'Complete', 'Blocked', 'At Risk'];
export const PRIORITY_OPTIONS: Priority[] = ['High', 'Medium', 'Low'];
export const RAG_OPTIONS: RAG[] = ['🟢 On Track', '🟡 At Risk', '🔴 Off Track', ''];

export const STATUS_COLORS: Record<Status, string> = {
  'Not Started': '#94a3b8',
  'In Progress': '#f59e0b',
  'Complete': '#22c55e',
  'Blocked': '#ef4444',
  'At Risk': '#f97316',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  'High': '#ef4444',
  'Medium': '#f59e0b',
  'Low': '#22c55e',
};
