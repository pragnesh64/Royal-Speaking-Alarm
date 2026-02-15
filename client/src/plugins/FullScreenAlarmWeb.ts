import { WebPlugin } from '@capacitor/core';
import type { FullScreenAlarmPlugin } from './FullScreenAlarm';

export class FullScreenAlarmWeb extends WebPlugin implements FullScreenAlarmPlugin {
  async schedule(options: {
    id: number;
    title: string;
    body: string;
    triggerAtMillis: number;
    type?: string;
    allowWhileIdle?: boolean;
  }): Promise<{ success: boolean; alarmId: number }> {
    console.log('[Web] FullScreenAlarm.schedule() called with:', options);
    console.warn('[Web] Full-screen alarms are not supported on web platform');
    return { success: false, alarmId: options.id };
  }

  async scheduleRepeating(options: {
    id: number;
    title: string;
    body: string;
    hour: number;
    minute: number;
    type?: string;
  }): Promise<{ success: boolean; alarmId: number }> {
    console.log('[Web] FullScreenAlarm.scheduleRepeating() called with:', options);
    console.warn('[Web] Full-screen alarms are not supported on web platform');
    return { success: false, alarmId: options.id };
  }

  async cancel(options: { id: number }): Promise<{ success: boolean }> {
    console.log('[Web] FullScreenAlarm.cancel() called with:', options);
    return { success: true };
  }
}
