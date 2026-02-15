/**
 * Vercel Serverless Function Entry Point
 * 
 * This file wraps the Express app as a Vercel serverless function.
 * All API routes are handled through this single entry point.
 */
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";
import { WebhookHandlers } from "../server/webhookHandlers";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Stripe webhook route (BEFORE json parser — needs raw body)
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      if (!Buffer.isBuffer(req.body)) {
        console.error('[Stripe] Webhook body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('[Stripe] Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

// Enable ETag for automatic client caching
app.set('etag', 'weak');

// Body parsers
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (duration > 500) {
        logLine = `⚠️ SLOW ${logLine}`;
      }
      console.log(logLine);
    }
  });

  next();
});

// Register all routes
const httpServer = createServer(app);
let isRoutesRegistered = false;

async function ensureRoutes() {
  if (!isRoutesRegistered) {
    await registerRoutes(httpServer, app);
    
    // Error handler
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Server Error:", err);
      if (res.headersSent) {
        return next(err);
      }
      return res.status(status).json({ message });
    });
    
    isRoutesRegistered = true;
  }
}

// Ensure routes are registered before handling requests
const routesPromise = ensureRoutes();

// Export for Vercel
export default async function handler(req: any, res: any) {
  await routesPromise;
  return app(req, res);
}

