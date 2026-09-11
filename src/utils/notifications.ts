import { Habit } from '../types';

export type WindowStatus = 'upcoming' | 'active' | 'overdue' | 'completed';

export interface ParsedTime {
  hours: number;
  minutes: number;
  totalMinutes: number;
  formatted: string; // e.g. "08:00 AM"
}

/**
 * Safely parse HH:MM or 12-hour formatted time string
 */
export function parseTimeString(timeStr: string): ParsedTime {
  if (!timeStr || typeof timeStr !== 'string') {
    return { hours: 8, minutes: 0, totalMinutes: 480, formatted: '08:00 AM' };
  }

  const clean = timeStr.trim();
  const is12Hour = /am|pm/i.test(clean);

  if (is12Hour) {
    const parts = clean.split(/\s+/);
    const timeParts = parts[0].split(':');
    let h = parseInt(timeParts[0], 10) || 0;
    const m = parseInt(timeParts[1], 10) || 0;
    const modifier = parts[1] ? parts[1].toUpperCase() : 'AM';
    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    const totalMinutes = h * 60 + m;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return {
      hours: h,
      minutes: m,
      totalMinutes,
      formatted: `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`
    };
  }

  const [hStr, mStr] = clean.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const totalMinutes = h * 60 + m;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const formatted = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;

  return {
    hours: h,
    minutes: m,
    totalMinutes,
    formatted
  };
}

export interface ScheduledAlarm {
  habitId: string;
  habitName: string;
  reminderTime: string; // e.g. "11:00" or "08:30"
  formattedTime: string; // e.g. "11:00 AM"
  enabled: boolean;
  lastTriggeredDate?: string;
}

const ALARMS_STORAGE_KEY = 'vicfungo_scheduled_alarms';

/**
 * Save all active scheduled alarms to localStorage so they persist across tabs and reloads
 */
export function saveScheduledAlarms(habits: Habit[]): ScheduledAlarm[] {
  if (typeof window === 'undefined') return [];

  const existingAlarms = getScheduledAlarms();
  const existingMap = new Map(existingAlarms.map(a => [a.habitId, a]));

  const alarms: ScheduledAlarm[] = habits
    .filter(h => !h.isArchived)
    .map(h => {
      const parsed = parseTimeString(h.reminderTime);
      const existing = existingMap.get(h.id);
      return {
        habitId: h.id,
        habitName: h.name,
        reminderTime: h.reminderTime || '08:00',
        formattedTime: parsed.formatted,
        enabled: h.reminderEnabled !== false,
        lastTriggeredDate: existing?.lastTriggeredDate
      };
    });

  try {
    localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
  } catch (e) {
    console.warn('Failed to save scheduled alarms to localStorage:', e);
  }

  return alarms;
}

/**
 * Retrieve saved scheduled alarms from localStorage
 */
export function getScheduledAlarms(): ScheduledAlarm[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALARMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to parse scheduled alarms from localStorage:', e);
    return [];
  }
}

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission (Soft-permission pattern)
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return Notification.permission || 'denied';
  }
}

/**
 * Fire a native system browser notification
 */
export function fireBrowserNotification(
  title: string, 
  body: string, 
  icon?: string, 
  tag?: string, 
  requireInteraction: boolean = true
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: icon || '/favicon.ico',
      tag: tag || 'vicfungo-habit-reminder',
      requireInteraction
    });

    return true;
  } catch (error) {
    console.warn('Failed to display browser notification:', error);
    return false;
  }
}

/**
 * Determine dynamic card window state based on local system clock
 */
export function calculateWindowStatus(
  reminderTime: string,
  isCompleted: boolean,
  selectedDate: string
): {
  status: WindowStatus;
  formattedTime: string;
  diffMinutes: number;
} {
  const parsed = parseTimeString(reminderTime);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (isCompleted) {
    return {
      status: 'completed',
      formattedTime: parsed.formatted,
      diffMinutes: 0
    };
  }

  // If viewing a future date
  if (selectedDate > todayStr) {
    return {
      status: 'upcoming',
      formattedTime: parsed.formatted,
      diffMinutes: 0
    };
  }

  // If viewing a past date that wasn't completed
  if (selectedDate < todayStr) {
    return {
      status: 'overdue',
      formattedTime: parsed.formatted,
      diffMinutes: -1440
    };
  }

  // Viewing today: evaluate against local clock
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const scheduledTotalMinutes = parsed.totalMinutes;

  // Active Window: Within 1 hour (from scheduled time to scheduled time + 60 mins)
  if (currentTotalMinutes >= scheduledTotalMinutes && currentTotalMinutes < scheduledTotalMinutes + 60) {
    return {
      status: 'active',
      formattedTime: parsed.formatted,
      diffMinutes: currentTotalMinutes - scheduledTotalMinutes
    };
  }

  // Overdue / Missed Window: Time has passed active window without completion
  if (currentTotalMinutes >= scheduledTotalMinutes + 60) {
    return {
      status: 'overdue',
      formattedTime: parsed.formatted,
      diffMinutes: currentTotalMinutes - scheduledTotalMinutes
    };
  }

  // Upcoming: Before scheduled time
  return {
    status: 'upcoming',
    formattedTime: parsed.formatted,
    diffMinutes: scheduledTotalMinutes - currentTotalMinutes
  };
}

/**
 * Checks all active habits against current time and dispatches reminders.
 * Dispatches native browser notification AND simultaneously triggers in-app alert banner.
 * Also synchronizes alarms to localStorage so they persist across tabs.
 */
export function checkAndDispatchDueReminders(
  habits: Habit[],
  onAlert: (title: string, message: string, habit: Habit) => void
): string[] {
  if (typeof window === 'undefined') return [];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const dispatchedHabitIds: string[] = [];

  // Update persistent alarms in localStorage
  saveScheduledAlarms(habits);

  habits.forEach(habit => {
    if (habit.isArchived) return;
    if (habit.reminderEnabled === false) return;

    // If completed today, no reminder needed
    if (habit.records && habit.records[todayStr]?.completed) return;

    const parsed = parseTimeString(habit.reminderTime);
    const scheduledMinutes = parsed.totalMinutes;

    // Check if the current time has hit the scheduled time (within a 30-minute window)
    const isDue = currentTotalMinutes >= scheduledMinutes && currentTotalMinutes <= scheduledMinutes + 30;

    if (isDue) {
      const storageKey = `vicfungo_notified_${habit.id}_${parsed.formatted.replace(/\s+/g, '_')}_${todayStr}`;
      const alreadyNotified = localStorage.getItem(storageKey);

      if (!alreadyNotified) {
        localStorage.setItem(storageKey, 'true');
        dispatchedHabitIds.push(habit.id);

        const habitContractTitle = (habit as any).title || habit.name;
        const title = '⏰ Vicfungo Habit Alert';
        const body = 'Time to complete your contract: ' + habitContractTitle;

        // System-Level Alarm Trigger:
        // When a habit time matches the system clock, check:
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('⏰ Vicfungo Habit Alert', {
              body: 'Time to complete your contract: ' + habitContractTitle,
              icon: '/favicon.ico',
              tag: habit.id, // prevents duplicate stacking
              requireInteraction: true // keeps the notification visible until interacted with
            });
          } catch (e) {
            console.warn('Native system notification error:', e);
          }
        }

        // Keep the existing in-app toast banner as a fallback companion
        onAlert(title, body, habit);

        // 3. Mark lastTriggeredDate in persistent alarm registry
        try {
          const alarms = getScheduledAlarms();
          const target = alarms.find(a => a.habitId === habit.id);
          if (target) {
            target.lastTriggeredDate = todayStr;
            localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
          }
        } catch {
          // ignore
        }
      }
    }
  });

  return dispatchedHabitIds;
}
