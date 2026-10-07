import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (toast: ToastMessage) => void;
type RemoveListener = (id: string) => void;

class ToastManager {
  private toasts: ToastMessage[] = [];
  private addListeners: ToastListener[] = [];
  private removeListeners: RemoveListener[] = [];

  subscribeAdd(listener: ToastListener) {
    this.addListeners.push(listener);
    return () => {
      this.addListeners = this.addListeners.filter(l => l !== listener);
    };
  }

  subscribeRemove(listener: RemoveListener) {
    this.removeListeners.push(listener);
    return () => {
      this.removeListeners = this.removeListeners.filter(l => l !== listener);
    };
  }

  add(message: string, type: ToastType = 'info', duration = 3000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { id, message, type, duration };
    this.toasts.push(toast);
    this.addListeners.forEach(l => l(toast));
    
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.removeListeners.forEach(l => l(id));
  }
}

export const toastManager = new ToastManager();

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Initial sync in case there are already toasts
    setToasts([...toastManager['toasts']]);

    const unsubAdd = toastManager.subscribeAdd((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
    
    const unsubRemove = toastManager.subscribeRemove((id) => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    });

    return () => {
      unsubAdd();
      unsubRemove();
    };
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    return toastManager.add(message, type, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    toastManager.remove(id);
  }, []);

  return { toasts, addToast, removeToast };
}
