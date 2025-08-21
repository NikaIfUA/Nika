import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm/';
import * as schema from './schema.ts'; // Import all schemas
import { categories, images, materials } from './schema.ts';
import { getDbInstance } from './connection.ts';

export class Database {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(connectionString?: string) {
    this.db = getDbInstance(connectionString);
  }

  async getImages() {
    return this.db.select().from(images);
  }

  async getImageById(id: string) {
    const result = await this.db.select().from(images).where(eq(images.id, id));
    return result[0];
  }

  async getImagesByCategoryId(categoryId: string) {
    return this.db.select().from(images).where(eq(images.category_id, categoryId));
  }

  async getImagesByMaterialId(materialId: string) {
    return this.db.select().from(materials).where(eq(materials.imageId, materialId));
  }

  async getCategories() {
    return this.db.select().from(categories);
  }

  async getMaterials() {
    return this.db.select().from(materials);
  }
}