/**
 * PWA Service Worker Registration & Offline Management
 */

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('Vicfungo PWA: Service worker registered successfully with scope:', registration.scope);
          
          // Check for service worker updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('Vicfungo PWA: New content available, please refresh.');
                  } else {
                    console.log('Vicfungo PWA: Content is cached for offline use.');
                  }
                }
              };
            }
          };

          resolve(registration);
        })
        .catch((error) => {
          console.warn('Vicfungo PWA: Service worker registration failed:', error);
          resolve(null);
        });
    });
  });
}

/**
 * Dispatch a habit reminder notification via the active Service Worker registration
 */
export function dispatchSWNotification(
  title: string, 
  options: NotificationOptions & { vibrate?: number[] }
): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
    return navigator.serviceWorker.ready
      .then((registration) => {
        return registration.showNotification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          ...options
        } as NotificationOptions);
      })
      .catch((err) => {
        console.warn('SW showNotification failed, falling back to window Notification:', err);
        try {
          new Notification(title, options);
        } catch (e) {
          console.warn('Fallback Notification failed:', e);
        }
      });
  } else if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, options);
    } catch (e) {
      console.warn('Direct Notification failed:', e);
    }
  }

  return Promise.resolve();
}
