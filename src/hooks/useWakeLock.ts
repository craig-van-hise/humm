import { useEffect, useRef, useState } from 'react';

export function useWakeLock(isActive: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  useEffect(() => {
    if (!isSupported || !isActive) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      return;
    }

    const requestLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    };

    requestLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isActive, isSupported]);

  return { isSupported };
}
