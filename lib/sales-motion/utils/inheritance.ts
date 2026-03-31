import type { Task, Motion, MultiUserState, UserId } from '../types';

export function getParentMotion(motion: Motion, fullState: MultiUserState): Motion | null {
  if (!motion.parentMotionId || !motion.parentUserId) return null;
  const parentUser = fullState.users[motion.parentUserId as UserId];
  if (!parentUser) return null;
  return parentUser.motions.find((m) => m.id === motion.parentMotionId) ?? null;
}

export function resolveEffectiveTask(task: Task, parentMotion: Motion | null): Task {
  if (!parentMotion || task.isOverridden !== false) return task;
  if (!task.parentTaskId) return task;
  for (const cat of parentMotion.categories) {
    const parentTask = cat.tasks.find((t) => t.id === task.parentTaskId);
    if (parentTask) {
      return {
        ...task,
        status: parentTask.status,
        rag: parentTask.rag,
      };
    }
  }
  return task;
}

export function isChildMotion(motion: Motion): boolean {
  return !!motion.parentMotionId;
}

export function countChildren(motion: Motion, fullState: MultiUserState): number {
  let count = 0;
  for (const user of Object.values(fullState.users)) {
    for (const m of user.motions) {
      if (m.parentMotionId === motion.id) count++;
    }
  }
  return count;
}
