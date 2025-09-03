import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema.ts';
import { categories, materials } from './schema.ts';
import { getDbInstance } from './connection.ts';

export class Database {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(connectionString?: string) {
    this.db = getDbInstance(connectionString);
  }

  async getCategories() {
    return await this.db.select().from(categories);
  }

  async getMaterials() {
    return await this.db.select().from(materials);
  }
}
