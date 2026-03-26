'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ToastContext = createContext<{ toast: (msg: string, type?: ToastData['type']) => void }>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  const bgColor = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`${bgColor[t.type]} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm`}>
            {t.message}
            <button onClick={() => remove(t.id)} className="ml-2 hover:opacity-70"><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
