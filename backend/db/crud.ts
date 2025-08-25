import { PostgresJsDatabase } from '../dependencies.ts';
import { eq } from 'drizzle-orm/';
import * as schema from './schema.ts'; // Import all schemas
import { categories, images, materials, imageMaterials } from './schema.ts';
import { IImage } from '../Interfaces.ts';
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