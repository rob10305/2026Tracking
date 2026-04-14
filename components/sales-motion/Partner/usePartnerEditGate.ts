'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'partner-edit-unlocked';
const PARTNER_EDIT_PASSWORD = 'itmethods';

export function usePartnerEditGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === 'true') {
      setUnlocked(true);
    }
    setReady(true);
  }, []);

  const tryUnlock = (password: string): boolean => {
    if (password === PARTNER_EDIT_PASSWORD) {
      setUnlocked(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const lock = () => {
    setUnlocked(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return { unlocked, ready, tryUnlock, lock };
}
