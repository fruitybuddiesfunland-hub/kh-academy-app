import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { COURSE_DATA, VALID_PRODUCT_IDS } from "./course-data";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Simple in-memory token store: token -> userId
const tokenStore = new Map<string, string>();

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function getUserIdFromToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return tokenStore.get(token) || null;
  }
  return null;
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  (req as any).authUser = user;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await storage.ready;

  // Allow cross-origin requests
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.set("trust proxy", 1);

  // POST /api/login — returns a token
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const token = generateToken();
      tokenStore.set(token, user.id);
      const { password: _, ...safeUser } = user;
      return res.json({ ...safeUser, token });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Login failed" });
    }
  });

  // POST /api/logout — invalidates token
  app.post("/api/logout", (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      tokenStore.delete(token);
    }
    res.json({ message: "Logged out" });
  });

  // GET /api/me — returns current user from token
  app.get("/api/me", requireAuth, (req: Request, res: Response) => {
    const user = (req as any).authUser;
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // PATCH /api/me/password
  app.patch("/api/me/password", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).authUser;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "currentPassword and newPassword are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      const fullUser = await storage.getUser(user.id);
      if (!fullUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const isValid = await comparePasswords(currentPassword, fullUser.password);
      if (!isValid) {
        return res.status(403).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      await storage.clearMustChangePassword(user.id);
      return res.json({ message: "Password updated" });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Password update failed" });
    }
  });

  // GET /api/purchases
  app.get("/api/purchases", requireAuth, async (req: Request, res: Response) => {
    const user = (req as any).authUser;
    const purchases = await storage.getPurchasesByUserId(user.id);
    res.json(purchases);
  });

  // GET /api/course/:productId — serve course content with access control
  app.get("/api/course/:productId", requireAuth, async (req: Request, res: Response) => {
    const { productId } = req.params;
    if (!VALID_PRODUCT_IDS.includes(productId)) {
      return res.status(404).json({ message: "Course not found" });
    }

    // quick-start is free for all logged-in users
    if (productId !== "quick-start") {
      const user = (req as any).authUser;
      const purchases = await storage.getPurchasesByUserId(user.id);
      const purchasedIds = new Set(purchases.map((p) => p.productId));
      // Allow if user purchased this specific product OR the ultimate bundle
      if (!purchasedIds.has(productId) && !purchasedIds.has("ultimate-bundle")) {
        return res.status(403).json({ message: "Purchase required" });
      }
    }

    return res.json(COURSE_DATA[productId]);
  });

  // In-memory waitlist
  const waitlist: Array<{ name: string; email: string; product: string; createdAt: Date }> = [];

  // POST /api/signup/free — public endpoint for free Quick Start signup
  app.post("/api/signup/free", async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      if (!email || !name) {
        return res.status(400).json({ message: "Name and email are required" });
      }
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "This email is already registered." });
      }
      // Generate random 8-char password (letters + numbers, easy to type)
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
      let tempPassword = "";
      const bytes = randomBytes(8);
      for (let i = 0; i < 8; i++) {
        tempPassword += chars[bytes[i] % chars.length];
      }
      const hashedPassword = await hashPassword(tempPassword);
      const user = await storage.createUser({ email, password: hashedPassword, name }, true);
      // Auto-grant the free quick-start product
      await storage.createPurchase({ userId: user.id, productId: "quick-start" });
      return res.status(201).json({ success: true, email, tempPassword });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Signup failed" });
    }
  });

  // POST /api/signup/waitlist — public endpoint for paid product waitlist
  app.post("/api/signup/waitlist", async (req: Request, res: Response) => {
    try {
      const { name, email, product } = req.body;
      if (!email || !name || !product) {
        return res.status(400).json({ message: "Name, email, and product are required" });
      }
      waitlist.push({ name, email, product, createdAt: new Date() });
      return res.status(201).json({ success: true, message: "You're on the waitlist!" });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Waitlist signup failed" });
    }
  });

  // POST /api/admin/provision
  app.post("/api/admin/provision", async (req: Request, res: Response) => {
    try {
      const { email, password, products } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "email and password are required" });
      }
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ email, password: hashedPassword }, true);
      if (Array.isArray(products)) {
        for (const productId of products) {
          await storage.createPurchase({ userId: user.id, productId });
        }
      }
      const { password: _, ...safeUser } = user;
      return res.status(201).json(safeUser);
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Provisioning failed" });
    }
  });

  return httpServer;
}
