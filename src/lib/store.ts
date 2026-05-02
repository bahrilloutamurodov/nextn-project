import { UserProfile, Level } from './types';
import { INITIAL_LEVELS } from './questions';

const STORAGE_KEY = 'eduquest_user_data';
const LEVELS_KEY = 'eduquest_levels_data';

export const saveUserProfile = (profile: UserProfile) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
};

export const getUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveLevels = (levels: Level[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LEVELS_KEY, JSON.stringify(levels));
  }
};

export const getLevels = (): Level[] => {
  if (typeof window === 'undefined') return INITIAL_LEVELS;
  const data = localStorage.getItem(LEVELS_KEY);
  return data ? JSON.parse(data) : INITIAL_LEVELS;
};

export const resetProgress = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEVELS_KEY);
  }
};

export const unlockAllLevels = () => {
  const levels = getLevels();
  const updated = levels.map(l => ({ ...l, unlocked: true }));
  saveLevels(updated);
  return updated;
};

export const lockAllLevels = () => {
  const levels = getLevels();
  const updated = levels.map((l, i) => ({ ...l, unlocked: i === 0, completed: false, highScore: 0 }));
  saveLevels(updated);
  return updated;
};
