import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"), // Optional for Replit Auth
  subscriptionStatus: text("subscription_status").default("trial"), // trial, active, expired
  trialEndsAt: timestamp("trial_ends_at").defaultNow(),
  language: text("language").default("english"), // hindi, english, marathi
});

export const alarms = pgTable("alarms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  time: text("time").notNull(), // HH:mm format
  days: text("days").array(), // ["Mon", "Tue", ...]
  isActive: boolean("is_active").default(true),
  type: text("type").default("speaking"), // speaking, custom_voice, text
  voiceUrl: text("voice_url"), // URL to recorded audio
  textToSpeak: text("text_to_speak"),
  voiceGender: text("voice_gender").default("female"), // male, female
});

export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  timeOfDay: text("time_of_day").notNull(), // morning, afternoon, evening, night
  dosage: text("dosage"),
});

export const insertUserSchema = createInsertSchema(users);
export const insertAlarmSchema = createInsertSchema(alarms).omit({ id: true });
export const insertMedicineSchema = createInsertSchema(medicines).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Alarm = typeof alarms.$inferSelect;
export type InsertAlarm = z.infer<typeof insertAlarmSchema>;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
