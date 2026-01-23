import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { seed } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Seed Database
  seed().catch(console.error);

  // Alarms
  app.get(api.alarms.list.path, async (req, res) => {
    // For MVP/Demo without proper logged-in user context in 'users' table (since we use Replit Auth separately),
    // we'll simulate a user ID 1 or use the auth context if we sync them.
    // To keep it simple for the blueprint integration:
    // We'll assume a default user for demo purposes or strictly enforce auth.
    // Let's use ID 1 for now as a placeholder or strict check.
    const userId = 1; // TODO: Map Replit Auth user to our 'users' table
    const alarms = await storage.getAlarms(userId);
    res.json(alarms);
  });

  app.post(api.alarms.create.path, async (req, res) => {
    try {
      const input = api.alarms.create.input.parse(req.body);
      const alarm = await storage.createAlarm(input);
      res.status(201).json(alarm);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      throw err;
    }
  });

  app.put(api.alarms.update.path, async (req, res) => {
    try {
      const input = api.alarms.update.input.parse(req.body);
      const alarm = await storage.updateAlarm(Number(req.params.id), input);
      res.json(alarm);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      res.status(404).json({ message: "Alarm not found" });
    }
  });

  app.delete(api.alarms.delete.path, async (req, res) => {
    await storage.deleteAlarm(Number(req.params.id));
    res.status(204).end();
  });

  // Medicines
  app.get(api.medicines.list.path, async (req, res) => {
    const userId = 1; // Placeholder
    const medicines = await storage.getMedicines(userId);
    res.json(medicines);
  });

  app.post(api.medicines.create.path, async (req, res) => {
    try {
      const input = api.medicines.create.input.parse(req.body);
      const medicine = await storage.createMedicine(input);
      res.status(201).json(medicine);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      throw err;
    }
  });

  app.delete(api.medicines.delete.path, async (req, res) => {
    await storage.deleteMedicine(Number(req.params.id));
    res.status(204).end();
  });

  // Upload (Mock)
  app.post(api.upload.create.path, async (req, res) => {
    // In a real app, use multer to save to disk or S3
    // Here we just return a mock URL
    res.json({ url: "https://placehold.co/400" });
  });

  return httpServer;
}
