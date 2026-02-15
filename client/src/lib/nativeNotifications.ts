import { LocalNotifications, ScheduleOptions, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import FullScreenAlarm from '@/plugins/FullScreenAlarm';

export interface AlarmData {
  id: number;
  title: string;
  body: string;
  time: string;
  days?: string[];
  date?: string;
  type: 'alarm' | 'medicine' | 'meeting';
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period) {
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
  }
  
  return { hours, minutes };
}

function getNextOccurrence(hours: number, minutes: number, days?: string[], specificDate?: string): Date {
  const now = new Date();
  
  if (specificDate) {
    const [year, month, day] = specificDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, 0);
    return date;
  }
  
  if (days && days.length > 0) {
    const dayMap: Record<string, number> = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    };
    
    const currentDay = now.getDay();
    let minDaysUntil = 7;
    
    for (const day of days) {
      const targetDay = dayMap[day];
      let daysUntil = targetDay - currentDay;
      
      if (daysUntil < 0) daysUntil += 7;
      if (daysUntil === 0) {
        const todayTime = new Date(now);
        todayTime.setHours(hours, minutes, 0, 0);
        if (todayTime > now) {
          return todayTime;
        }
        daysUntil = 7;
      }
      
      if (daysUntil < minDaysUntil) {
        minDaysUntil = daysUntil;
      }
    }
    
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + minDaysUntil);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  }
  
  const todayTime = new Date(now);
  todayTime.setHours(hours, minutes, 0, 0);
  
  if (todayTime > now) {
    return todayTime;
  }
  
  todayTime.setDate(todayTime.getDate() + 1);
  return todayTime;
}

export async function isNativeApp(): Promise<boolean> {
  return Capacitor.isNativePlatform();
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!await isNativeApp()) return false;
  
  const permission = await LocalNotifications.requestPermissions();
  return permission.display === 'granted';
}

export async function scheduleNativeAlarm(alarm: AlarmData): Promise<boolean> {
  if (!await isNativeApp()) {
    console.log('[Native] Not a native app, skipping alarm schedule');
    return false;
  }

  try {
    const { hours, minutes } = parseTime(alarm.time);
    const scheduleDate = getNextOccurrence(hours, minutes, alarm.days, alarm.date);

    console.log(`[Native] ========================================`);
    console.log(`[Native] Scheduling full-screen alarm ${alarm.id}`);
    console.log(`[Native] Title: ${alarm.title}`);
    console.log(`[Native] Time: ${scheduleDate.toLocaleString()}`);
    console.log(`[Native] Days: ${alarm.days?.join(', ') || 'None (one-time)'}`);
    console.log(`[Native] ========================================`);

    // Check if FullScreenAlarm plugin is available
    if (!FullScreenAlarm) {
      console.error('[Native] ✗ FullScreenAlarm plugin is NOT available!');
      return false;
    }
    console.log('[Native] ✓ FullScreenAlarm plugin is available');

    // Use FullScreenAlarm plugin for alarms that need to wake the screen
    if (alarm.days && alarm.days.length > 0) {
      // For recurring alarms, schedule each day
      const dayMap: Record<string, 1|2|3|4|5|6|7> = {
        'Sun': 1, 'Mon': 2, 'Tue': 3, 'Wed': 4, 'Thu': 5, 'Fri': 6, 'Sat': 7
      };

      for (const day of alarm.days) {
        const notificationId = alarm.id * 10 + dayMap[day];

        // Schedule repeating alarm for specific day
        await FullScreenAlarm.scheduleRepeating({
          id: notificationId,
          title: alarm.title,
          body: alarm.body,
          hour: hours,
          minute: minutes,
          type: alarm.type
        });
      }
    } else {
      // One-time alarm
      await FullScreenAlarm.schedule({
        id: alarm.id,
        title: alarm.title,
        body: alarm.body,
        triggerAtMillis: scheduleDate.getTime(),
        type: alarm.type,
        allowWhileIdle: true
      });
    }

    console.log(`[Native] Full-screen alarm ${alarm.id} scheduled successfully`);
    return true;
  } catch (error) {
    console.error('[Native] Failed to schedule full-screen alarm:', error);
    return false;
  }
}

export async function cancelNativeAlarm(alarmId: number): Promise<void> {
  if (!await isNativeApp()) return;

  try {
    // Cancel main alarm
    await FullScreenAlarm.cancel({ id: alarmId });

    // Cancel all day-specific alarms (for recurring alarms)
    for (let i = 1; i <= 7; i++) {
      await FullScreenAlarm.cancel({ id: alarmId * 10 + i });
    }

    console.log(`[Native] Cancelled full-screen alarm ${alarmId}`);
  } catch (error) {
    console.error('[Native] Failed to cancel full-screen alarm:', error);
  }
}

export async function syncAllAlarms(alarms: AlarmData[]): Promise<void> {
  if (!await isNativeApp()) return;

  try {
    console.log(`[Native] ======== SYNCING ${alarms.length} ALARMS ========`);

    // STEP 1: Cancel ALL old LocalNotifications alarms (old system)
    try {
      console.log('[Native] Step 1: Canceling old LocalNotifications alarms...');
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        const oldIds = pending.notifications.map(n => n.id);
        await LocalNotifications.cancel({ notifications: oldIds.map(id => ({ id })) });
        console.log(`[Native] ✓ Canceled ${oldIds.length} old LocalNotifications alarms`);
      } else {
        console.log('[Native] ✓ No old LocalNotifications alarms to cancel');
      }
    } catch (error) {
      console.error('[Native] Failed to cancel old LocalNotifications:', error);
    }

    // STEP 2: Cancel all existing FullScreenAlarm alarms
    console.log('[Native] Step 2: Canceling existing FullScreenAlarm alarms...');
    const allAlarmIds = alarms.map(a => a.id);
    for (const id of allAlarmIds) {
      await cancelNativeAlarm(id);
    }
    console.log(`[Native] ✓ Canceled ${allAlarmIds.length} FullScreenAlarm alarms`);

    // STEP 3: Schedule all active alarms with FullScreenAlarm
    console.log('[Native] Step 3: Scheduling new FullScreenAlarm alarms...');
    let successCount = 0;
    let failCount = 0;
    for (const alarm of alarms) {
      const success = await scheduleNativeAlarm(alarm);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log(`[Native] ✓ Sync complete: ${successCount} succeeded, ${failCount} failed`);
    console.log(`[Native] ========================================`);
  } catch (error) {
    console.error('[Native] Failed to sync full-screen alarms:', error);
  }
}

export async function initializeNativeNotifications(): Promise<void> {
  if (!await isNativeApp()) return;
  
  await requestNotificationPermission();
  
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('[Native] Notification received:', notification);
  });
  
  LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    console.log('[Native] Notification action:', action);
    if (action.actionId === 'tap') {
      window.location.href = '/';
    }
  });
}
