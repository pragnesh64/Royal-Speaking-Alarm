import { storage } from "./storage";
import { db } from "./db";

export async function seed() {
  // Check if we have any data
  const existingAlarms = await storage.getAlarms(1);
  if (existingAlarms.length > 0) return;

  console.log("Seeding database...");

  // Create a default user if not exists (simulate)
  // In real app, we wait for user to login via Replit Auth
  // We'll just seed alarms/medicines for userId 1

  await storage.createAlarm({
    userId: 1,
    title: "Morning Wake Up",
    time: "07:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    isActive: true,
    type: "speaking",
    textToSpeak: "Good morning! It's time to wake up and conquer the day.",
    voiceGender: "female"
  });

  await storage.createAlarm({
    userId: 1,
    title: "Water Reminder",
    time: "10:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    isActive: true,
    type: "text",
    textToSpeak: "Drink some water to stay hydrated."
  });

  await storage.createMedicine({
    userId: 1,
    name: "Vitamin D",
    timeOfDay: "morning",
    dosage: "1 tablet",
    photoUrl: "https://placehold.co/100?text=Vit+D"
  });

  await storage.createMedicine({
    userId: 1,
    name: "Omega 3",
    timeOfDay: "afternoon",
    dosage: "1 capsule",
    photoUrl: "https://placehold.co/100?text=Omega3"
  });

  console.log("Seeding complete!");
}
