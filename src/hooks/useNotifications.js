import { useCallback, useEffect, useState } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback(async (title, options = {}) => {
    if (permission === 'granted') {
      try {
        // PWA standard: use ServiceWorker registration for background support
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration.showNotification) {
            registration.showNotification(title, {
              icon: '/favicon.png',
              badge: '/favicon.png',
              ...options
            });
            return;
          }
        }

        // Fallback for non-PWA environments
        new Notification(title, {
          icon: '/favicon.png',
          badge: '/favicon.png',
          ...options
        });
      } catch (err) {
        console.error('Failed to send notification:', err);
      }
    }
  }, [permission]);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    permission,
    requestPermission,
    sendNotification
  };
};
