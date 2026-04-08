import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { COURSE_DATA, VALID_PRODUCT_IDS } from "./course-data";
import Stripe from "stripe";
import { Resend } from "resend";

// Product display names
const PRODUCT_NAMES: Record<string, string> = {
  "quick-start": "AI Quick Start",
  "starter-kit": "AI Starter Kit",
  "skills-builder": "AI Skills Builder",
  "small-business": "AI for Small Business",
  "automation-mastery": "AI Automation Mastery",
  "ultimate-bundle": "Ultimate AI Bundle",
};

// Stripe price ID → internal product ID mapping
const STRIPE_PRICE_MAP: Record<string, { productId: string; name: string }> = {
  // Live mode price IDs — updated April 2026 (new prices: $29/$39/$59/$79/$119)
  "price_1TJxltArAw5l5wB902CKd7OU": { productId: "starter-kit", name: "AI Starter Kit" },
  "price_1TJxltArAw5l5wB97sW0uS0f": { productId: "skills-builder", name: "AI Skills Builder" },
  "price_1TJxltArAw5l5wB9woNwsujd": { productId: "small-business", name: "AI for Small Business" },
  "price_1TJxltArAw5l5wB9TObqfO5P": { productId: "automation-mastery", name: "AI Automation Mastery" },
  "price_1TJxltArAw5l5wB9HfRbW9xx": { productId: "ultimate-bundle", name: "Ultimate AI Bundle" },
  // Legacy price IDs (old prices — kept for webhook compatibility with past purchases)
  "price_1TBdaPArAw5l5wB9bNTlXhP4": { productId: "starter-kit", name: "AI Starter Kit" },
  "price_1TBca6ArAw5l5wB9HMHqQDSw": { productId: "skills-builder", name: "AI Skills Builder" },
  "price_1TBcaWArAw5l5wB9tRtT6zUW": { productId: "small-business", name: "AI for Small Business" },
  "price_1TBcatArAw5l5wB9246xvAab": { productId: "automation-mastery", name: "AI Automation Mastery" },
  "price_1TBcbDArAw5l5wB9emU5K3dG": { productId: "ultimate-bundle", name: "Ultimate AI Bundle" },
};

// Internal product ID → Stripe price ID (reverse lookup — new prices take priority for checkout)
const PRODUCT_TO_PRICE: Record<string, string> = {
  "starter-kit":       "price_1TJxltArAw5l5wB902CKd7OU",
  "skills-builder":    "price_1TJxltArAw5l5wB97sW0uS0f",
  "small-business":    "price_1TJxltArAw5l5wB9woNwsujd",
  "automation-mastery":"price_1TJxltArAw5l5wB9TObqfO5P",
  "ultimate-bundle":   "price_1TJxltArAw5l5wB9HfRbW9xx",
};

// For the bundle, grant all individual products
const BUNDLE_PRODUCTS = ["starter-kit", "skills-builder", "small-business", "automation-mastery"];

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

// Password reset tokens: token -> { email, expiresAt }
const resetTokenStore = new Map<string, { email: string; expiresAt: Date }>();

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

  // POST /api/forgot-password — send reset link
  app.post("/api/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      // Always return success to avoid email enumeration
      if (!user) {
        return res.json({ message: "If that email exists, a reset link has been sent." });
      }
      // Generate reset token (valid for 1 hour)
      const resetToken = generateToken();
      resetTokenStore.set(resetToken, {
        email: user.email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      // Send reset email
      if (resend) {
        const resetUrl = `https://app.kh-academy.com/#/reset-password/${resetToken}`;
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: "Reset your password — KH Academy",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="font-size: 24px; color: #111; text-align: center;">Password Reset</h1>
                <p style="font-size: 16px; color: #333; line-height: 1.6;">We received a request to reset your KH Academy password.</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 15px;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #666; line-height: 1.6;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
              </div>
            `,
          });
        } catch (err: any) {
          console.error("Failed to send reset email:", err.message);
        }
      } else {
        console.log(`[Resend not configured] Reset token for ${email}: ${resetToken}`);
      }
      return res.json({ message: "If that email exists, a reset link has been sent." });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Request failed" });
    }
  });

  // POST /api/reset-password — use reset token to set new password
  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const resetData = resetTokenStore.get(token);
      if (!resetData) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }
      if (new Date() > resetData.expiresAt) {
        resetTokenStore.delete(token);
        return res.status(400).json({ message: "Reset link has expired. Please request a new one." });
      }
      const user = await storage.getUserByEmail(resetData.email);
      if (!user) {
        return res.status(400).json({ message: "Account not found" });
      }
      const hashedPw = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPw);
      await storage.clearMustChangePassword(user.id);
      // Remove used token
      resetTokenStore.delete(token);
      return res.json({ message: "Password has been reset. You can now log in." });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Reset failed" });
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
      // Send login email
      await sendLoginEmail(email, tempPassword, "AI Quick Start");
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

  // ─── Resend Email ────────────────────────────────────────────
  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;
  const FROM_EMAIL = process.env.FROM_EMAIL || "KH Academy <hello@send.kh-academy.com>";

  async function sendLoginEmail(email: string, password: string, productName: string) {
    if (!resend) {
      console.log(`[Resend not configured] Would send login email to ${email}`);
      return;
    }
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Your ${productName} access is ready — KH Academy`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; color: #111; margin: 0;">Welcome to KH Academy</h1>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Thank you for purchasing <strong>${productName}</strong>. Your course access is ready.</p>
            <div style="background: #f4f0ff; border: 1px solid #e0d4fc; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="font-size: 14px; color: #666; margin: 0 0 12px;"><strong>Your Login Credentials</strong></p>
              <p style="font-size: 15px; color: #111; margin: 0 0 8px;">Email: <strong>${email}</strong></p>
              <p style="font-size: 15px; color: #111; margin: 0;">Password: <strong>${password}</strong></p>
            </div>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">You'll be asked to change your password on first login.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://app.kh-academy.com" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">Access Your Course</a>
            </div>
            <p style="font-size: 13px; color: #999; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px; margin-top: 32px;">If you have any questions, reply to this email or contact us at info@kh-academy.com</p>
          </div>
        `,
      });
      console.log(`Login email sent to ${email}`);
    } catch (err: any) {
      console.error(`Failed to send email to ${email}:`, err.message);
    }
  }

  // ─── Stripe Checkout ───────────────────────────────────────────
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

  // GET /api/health — check if services are configured
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      stripe: !!stripeSecretKey,
      webhook: !!stripeWebhookSecret,
      resend: !!resendApiKey,
    });
  });

  // POST /api/checkout — create a Stripe Checkout session
  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payments are not configured yet" });
      }
      const { productId, email } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "productId is required" });
      }
      const priceId = PRODUCT_TO_PRICE[productId];
      if (!priceId) {
        return res.status(400).json({ message: "Invalid product" });
      }

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `https://www.kh-academy.com/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://www.kh-academy.com/#products`,
        metadata: { productId },
      };

      // Pre-fill email if provided
      if (email) {
        sessionParams.customer_email = email;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      return res.json({ url: session.url });
    } catch (err: any) {
      console.error("Checkout error:", err);
      return res.status(500).json({ message: err.message || "Checkout failed" });
    }
  });

  // POST /api/webhook/stripe — handle Stripe webhook events
  // IMPORTANT: This must use the raw body, not parsed JSON
  app.post("/api/webhook/stripe", async (req: Request, res: Response) => {
    try {
      if (!stripe || !stripeWebhookSecret) {
        return res.status(503).json({ message: "Webhook not configured" });
      }

      const sig = req.headers["stripe-signature"] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody as Buffer,
          sig,
          stripeWebhookSecret
        );
      } catch (webhookErr: any) {
        console.error("Webhook signature verification failed:", webhookErr.message);
        return res.status(400).json({ message: "Invalid signature" });
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email || session.customer_email;
        const productId = session.metadata?.productId;

        if (customerEmail && productId) {
          console.log(`Payment received: ${customerEmail} purchased ${productId}`);

          // Check if user already exists
          let user = await storage.getUserByEmail(customerEmail);
          let tempPassword: string | null = null;

          if (!user) {
            // Create new user with temporary password
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
            tempPassword = "";
            const bytes = randomBytes(8);
            for (let i = 0; i < 8; i++) {
              tempPassword += chars[bytes[i] % chars.length];
            }
            const hashedPw = await hashPassword(tempPassword);
            user = await storage.createUser(
              { email: customerEmail, password: hashedPw, name: customerEmail.split("@")[0] },
              true
            );
            console.log(`Created new user: ${customerEmail}`);
          }

          // Grant product access
          if (productId === "ultimate-bundle") {
            // Bundle grants all individual products + the bundle itself
            for (const pid of [...BUNDLE_PRODUCTS, "ultimate-bundle"]) {
              await storage.createPurchase({ userId: user.id, productId: pid });
            }
          } else {
            await storage.createPurchase({ userId: user.id, productId });
          }
          // Also grant the free quick-start for any purchaser
          await storage.createPurchase({ userId: user.id, productId: "quick-start" });

          console.log(`Granted ${productId} access to ${customerEmail}`);

          // Send login credentials email
          const productName = PRODUCT_NAMES[productId] || productId;
          if (tempPassword) {
            await sendLoginEmail(customerEmail, tempPassword, productName);
          } else {
            // Existing user — send a simpler "new product added" email
            if (resend) {
              try {
                await resend.emails.send({
                  from: FROM_EMAIL,
                  to: customerEmail,
                  subject: `${productName} added to your account — KH Academy`,
                  html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
                      <h1 style="font-size: 24px; color: #111;">New Course Unlocked</h1>
                      <p style="font-size: 16px; color: #333; line-height: 1.6;"><strong>${productName}</strong> has been added to your KH Academy account.</p>
                      <p style="font-size: 16px; color: #333; line-height: 1.6;">Log in with your existing credentials to access it.</p>
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="https://app.kh-academy.com" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">Go to My Courses</a>
                      </div>
                    </div>
                  `,
                });
              } catch (err: any) {
                console.error(`Failed to send product-added email:`, err.message);
              }
            }
          }
        }
      }

      return res.json({ received: true });
    } catch (err: any) {
      console.error("Webhook error:", err);
      return res.status(500).json({ message: "Webhook processing failed" });
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
