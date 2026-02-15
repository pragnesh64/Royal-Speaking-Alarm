/**
 * Vercel Cron Job: Alarm Scheduler — Source file
 * 
 * Gets compiled by esbuild into api/cron/check-alarms.mjs
 * Runs every minute via Vercel Cron Jobs.
 */
import { db } from './db';
import { alarms, medicines, meetings } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { sendPushNotification } from './pushNotification';

function getCurrentTimeIST(): { time: string; day: string; date: string } {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = formatter.formatToParts(now);
  
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || '';
  
  const hours = getValue('hour').padStart(2, '0');
  const minutes = getValue('minute').padStart(2, '0');
  const time = `${hours}:${minutes}`;
  
  const weekdayMap: Record<string, string> = {
    'Sun': 'Sun', 'Mon': 'Mon', 'Tue': 'Tue', 'Wed': 'Wed',
    'Thu': 'Thu', 'Fri': 'Fri', 'Sat': 'Sat'
  };
  const day = weekdayMap[getValue('weekday')] || getValue('weekday');
  
  const year = getValue('year');
  const month = getValue('month').padStart(2, '0');
  const dateNum = getValue('day').padStart(2, '0');
  const date = `${year}-${month}-${dateNum}`;
  
  return { time, day, date };
}

function timeMatches(alarmTime: string, currentTime: string): boolean {
  return alarmTime.substring(0, 5) === currentTime;
}

export default async function handler(req: any, res: any) {
  // Security: verify cron secret
  const authHeader = req.headers?.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { time, day, date } = getCurrentTimeIST();
  console.log(`[Cron] Checking at ${time} on ${day} (${date})`);

  try {
    const [activeAlarms, activeMedicines, activeMeetings] = await Promise.all([
      db.select().from(alarms).where(eq(alarms.isActive, true)),
      db.select().from(medicines).where(eq(medicines.isActive, true)),
      db.select().from(meetings).where(eq(meetings.enabled, true)),
    ]);

    const pushPromises: Promise<any>[] = [];

    for (const alarm of activeAlarms) {
      let shouldTrigger = false;
      if (timeMatches(alarm.time, time)) {
        if (alarm.date) {
          shouldTrigger = alarm.date === date;
        } else if (alarm.days && alarm.days.length > 0) {
          shouldTrigger = alarm.days.includes(day);
        } else {
          shouldTrigger = true;
        }
      }
      if (shouldTrigger) {
        pushPromises.push(
          sendPushNotification(alarm.userId, {
            title: alarm.title || 'MyPA Alarm',
            body: alarm.textToSpeak || `${alarm.title} - Time!`,
            type: 'alarm',
            id: alarm.id,
            textToSpeak: alarm.textToSpeak || undefined,
            alarmType: alarm.type || 'speaking',
            voiceUrl: alarm.voiceUrl || undefined,
            imageUrl: alarm.imageUrl || undefined,
            language: alarm.language || 'english',
            days: alarm.days || undefined,
            duration: alarm.duration || 30,
            loop: alarm.loop !== false,
            voiceGender: alarm.voiceGender || 'female',
          })
        );
      }
    }

    for (const medicine of activeMedicines) {
      if (medicine.times?.length) {
        for (const medTime of medicine.times) {
          if (timeMatches(medTime, time)) {
            pushPromises.push(
              sendPushNotification(medicine.userId, {
                title: `Medicine: ${medicine.name}`,
                body: medicine.textToSpeak || `Time to take ${medicine.name}`,
                type: 'medicine',
                id: medicine.id,
              })
            );
          }
        }
      }
    }

    for (const meeting of activeMeetings) {
      if (timeMatches(meeting.time, time) && meeting.date === date) {
        pushPromises.push(
          sendPushNotification(meeting.userId, {
            title: `Meeting: ${meeting.title}`,
            body: meeting.textToSpeak || meeting.title,
            type: 'meeting',
            id: meeting.id,
          })
        );
      }
    }

    let results = { sent: 0, failed: 0 };
    if (pushPromises.length > 0) {
      const settled = await Promise.allSettled(pushPromises);
      results.sent = settled.filter(r => r.status === 'fulfilled').length;
      results.failed = settled.filter(r => r.status === 'rejected').length;
    }

    return res.status(200).json({ ok: true, time, day, date, notifications: results });
  } catch (error: any) {
    console.error('[Cron] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

