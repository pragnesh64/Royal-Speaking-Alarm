import { db } from "./db";
import {
  users, alarms, medicines, meetings, otpCodes,
  type User, type InsertUser,
  type Alarm, type InsertAlarm,
  type Medicine, type InsertMedicine,
  type Meeting, type InsertMeeting
} from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAlarms(userId: string): Promise<Alarm[]>;
  createAlarm(alarm: InsertAlarm): Promise<Alarm>;
  updateAlarm(id: number, alarm: Partial<InsertAlarm>): Promise<Alarm>;
  deleteAlarm(id: number): Promise<void>;

  getMedicines(userId: string): Promise<Medicine[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  deleteMedicine(id: number): Promise<void>;

  getMeetings(userId: string): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting>;
  deleteMeeting(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: username column was replaced by email in unified schema
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAlarms(userId: string): Promise<Alarm[]> {
    return await db.select().from(alarms).where(eq(alarms.userId, userId));
  }

  async createAlarm(alarm: InsertAlarm): Promise<Alarm> {
    const [newAlarm] = await db.insert(alarms).values(alarm).returning();
    return newAlarm;
  }

  async updateAlarm(id: number, alarm: Partial<InsertAlarm>): Promise<Alarm> {
    const [updatedAlarm] = await db
      .update(alarms)
      .set(alarm)
      .where(eq(alarms.id, id))
      .returning();
    return updatedAlarm;
  }

  async deleteAlarm(id: number): Promise<void> {
    await db.delete(alarms).where(eq(alarms.id, id));
  }

  async getMedicines(userId: string): Promise<Medicine[]> {
    return await db.select().from(medicines).where(eq(medicines.userId, userId));
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const [newMedicine] = await db.insert(medicines).values(medicine).returning();
    return newMedicine;
  }

  async updateMedicine(id: number, medicine: Partial<InsertMedicine>): Promise<Medicine> {
    const [updatedMedicine] = await db
      .update(medicines)
      .set(medicine)
      .where(eq(medicines.id, id))
      .returning();
    return updatedMedicine;
  }

  async deleteMedicine(id: number): Promise<void> {
    await db.delete(medicines).where(eq(medicines.id, id));
  }
  async updateUser(id: string, update: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }

  async getMeetings(userId: string): Promise<Meeting[]> {
    return await db.select().from(meetings).where(eq(meetings.userId, userId));
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [newMeeting] = await db.insert(meetings).values(meeting).returning();
    return newMeeting;
  }

  async updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting> {
    const [updatedMeeting] = await db
      .update(meetings)
      .set(meeting)
      .where(eq(meetings.id, id))
      .returning();
    return updatedMeeting;
  }

  async deleteMeeting(id: number): Promise<void> {
    await db.delete(meetings).where(eq(meetings.id, id));
  }

  // Auth methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createEmailUser(data: { email: string; passwordHash: string; firstName: string; lastName: string; authProvider: string }): Promise<User> {
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days trial
    const [user] = await db.insert(users).values({
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      authProvider: data.authProvider,
      subscriptionStatus: "trial",
      trialEndsAt,
    }).returning();
    return user;
  }

  async createPhoneUser(data: { phone: string; firstName: string; lastName: string; authProvider: string }): Promise<User> {
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days trial
    const [user] = await db.insert(users).values({
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      authProvider: data.authProvider,
      subscriptionStatus: "trial",
      trialEndsAt,
    }).returning();
    return user;
  }

  async createOtp(data: { phone: string; code: string; expiresAt: Date }): Promise<void> {
    await db.insert(otpCodes).values({
      phone: data.phone,
      code: data.code,
      expiresAt: data.expiresAt,
    });
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const now = new Date();
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, phone),
          eq(otpCodes.code, code),
          eq(otpCodes.used, false),
          gt(otpCodes.expiresAt, now)
        )
      );
    
    if (!otp) return false;
    
    // Mark OTP as used
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
    return true;
  }
}

export const storage = new DatabaseStorage();
