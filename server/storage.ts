import { type User, type InsertUser, type Purchase, type InsertPurchase } from "@shared/schema";
import { randomUUID, scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser, mustChangePassword?: boolean): Promise<User>;
  updateUserPassword(id: string, hashedPassword: string): Promise<void>;
  clearMustChangePassword(id: string): Promise<void>;
  getPurchasesByUserId(userId: string): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private purchases: Map<string, Purchase>;
  public ready: Promise<void>;

  constructor() {
    this.users = new Map();
    this.purchases = new Map();
    this.ready = this.seed();
  }

  private async seed() {
    const hashedPw = await hashPassword("Welcome123");
    const demoUserId = randomUUID();
    const demoUser: User = {
      id: demoUserId,
      email: "demo@kh-academy.com",
      password: hashedPw,
      name: "Demo User",
      mustChangePassword: true,
      createdAt: new Date(),
    };
    this.users.set(demoUserId, demoUser);

    // Seed demo user with all product purchases for testing
    for (const productId of ["starter-kit", "skills-builder", "small-business", "automation-mastery", "ultimate-bundle"]) {
      const purchaseId = randomUUID();
      const demoPurchase: Purchase = {
        id: purchaseId,
        userId: demoUserId,
        productId,
        purchasedAt: new Date(),
      };
      this.purchases.set(purchaseId, demoPurchase);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser, mustChangePassword = false): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, name: insertUser.name || null, mustChangePassword, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.password = hashedPassword;
    }
  }

  async clearMustChangePassword(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.mustChangePassword = false;
    }
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(
      (p) => p.userId === userId,
    );
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = randomUUID();
    const purchase: Purchase = { ...insertPurchase, id, purchasedAt: new Date() };
    this.purchases.set(id, purchase);
    return purchase;
  }
}

export const storage = new MemStorage();
