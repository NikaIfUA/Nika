import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, inArray } from 'drizzle-orm/';
import * as schema from './schema.ts'; // Import all schemas
import { categories, images, materials, imageMaterials, users, blacklisted_tokens } from './schema.ts';
import type { IImage, IUser } from '../interfaces.ts';
import { getDbInstance } from './connection.ts';

export class Database {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(connectionString?: string) {
    this.db = getDbInstance(connectionString);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    const row = rows[0];
    if (!row) return null;

    return row as unknown as IUser;
  }

  async addTokenToBlacklist(token: string, userId?: string) {
    const id = globalThis.crypto.randomUUID();
    await this.db.insert(blacklisted_tokens).values({ id, token, user_id: userId ?? null }).returning();
    return id;
  }

  async isTokenBlacklisted(token: string) {
    const rows = await this.db.select().from(blacklisted_tokens).where(eq(blacklisted_tokens.token, token)).limit(1);
    return rows.length > 0;
  }

  async isUserBlacklisted(userId: string) {
    if (!userId) return false;
    const rows = await this.db.select().from(blacklisted_tokens).where(eq(blacklisted_tokens.user_id, userId)).limit(1);
    return rows.length > 0;
  }

  async createUser(data: { name: string; email: string; passwordHash: string }) {
    const existing = await this.db.select().from(users).limit(1);
    const userId = existing.length === 0 ? '1' : globalThis.crypto.randomUUID();
    const { name, email, passwordHash } = data;

    await this.db.insert(users).values({
      id: userId,
      name,
      email,
      passwordHash,
    }).returning();

    return userId;
  }
}
