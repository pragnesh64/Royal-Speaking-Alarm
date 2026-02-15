/**
 * Vercel Cron Job: Alarm Scheduler
 * 
 * Runs every minute (configured in vercel.json).
 * Checks active alarms/medicines/meetings and sends push notifications.
 * 
 * This replaces the setInterval-based scheduler that runs on traditional servers.
 * Vercel Cron Jobs trigger this endpoint automatically.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { alarms, medicines, meetings } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { sendPushNotification } from '../../server/pushNotification';

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
  const alarmHHMM = alarmTime.substring(0, 5);
  return alarmHHMM === currentTime;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is called by Vercel Cron (security)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // If CRON_SECRET is not set, allow anyway (for testing)
    if (process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const { time, day, date } = getCurrentTimeIST();
  console.log(`[Cron] Checking alarms at ${time} on ${day} (${date})`);

  try {
    // Run all 3 queries in PARALLEL
    const [activeAlarms, activeMedicines, activeMeetings] = await Promise.all([
      db.select().from(alarms).where(eq(alarms.isActive, true)),
      db.select().from(medicines).where(eq(medicines.isActive, true)),
      db.select().from(meetings).where(eq(meetings.enabled, true)),
    ]);

    const pushPromises: Promise<any>[] = [];

    // Check alarms
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
        console.log(`[Cron] Triggering alarm ${alarm.id}: ${alarm.title}`);
        pushPromises.push(
          sendPushNotification(alarm.userId, {
            title: alarm.title || 'MyPA Alarm',
            body: alarm.textToSpeak || `${alarm.title} - Time to wake up!`,
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

    // Check medicines
    for (const medicine of activeMedicines) {
      if (medicine.times && medicine.times.length > 0) {
        for (const medTime of medicine.times) {
          if (timeMatches(medTime, time)) {
            console.log(`[Cron] Triggering medicine ${medicine.id}: ${medicine.name}`);
            pushPromises.push(
              sendPushNotification(medicine.userId, {
                title: `Medicine: ${medicine.name}`,
                body: medicine.textToSpeak || `Time to take ${medicine.name}${medicine.dosage ? ` - ${medicine.dosage}` : ''}`,
                type: 'medicine',
                id: medicine.id,
                textToSpeak: medicine.textToSpeak || undefined,
                alarmType: medicine.type || 'speaking',
                voiceUrl: medicine.voiceUrl || undefined,
                imageUrl: medicine.photoUrl || undefined,
                photoUrl: medicine.photoUrl || undefined,
                dosage: medicine.dosage || undefined,
                language: medicine.language || 'english',
                duration: medicine.duration || 30,
                loop: medicine.loop !== false,
                voiceGender: medicine.voiceGender || 'female',
              })
            );
          }
        }
      }
    }

    // Check meetings
    for (const meeting of activeMeetings) {
      if (timeMatches(meeting.time, time) && meeting.date === date) {
        console.log(`[Cron] Triggering meeting ${meeting.id}: ${meeting.title}`);
        pushPromises.push(
          sendPushNotification(meeting.userId, {
            title: `Meeting: ${meeting.title}`,
            body: meeting.textToSpeak || `${meeting.title}${meeting.location ? ` at ${meeting.location}` : ''}`,
            type: 'meeting',
            id: meeting.id,
            textToSpeak: meeting.textToSpeak || undefined
          })
        );
      }
    }

    // Send all notifications in parallel
    let results = { sent: 0, failed: 0 };
    if (pushPromises.length > 0) {
      const settled = await Promise.allSettled(pushPromises);
      results.sent = settled.filter(r => r.status === 'fulfilled').length;
      results.failed = settled.filter(r => r.status === 'rejected').length;
    }

    return res.status(200).json({
      ok: true,
      time,
      day,
      date,
      checked: {
        alarms: activeAlarms.length,
        medicines: activeMedicines.length,
        meetings: activeMeetings.length,
      },
      notifications: results,
    });
  } catch (error: any) {
    console.error('[Cron] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

