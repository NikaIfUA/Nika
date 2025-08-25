import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm/';
import * as schema from '../db/schema.ts'; // Import all schemas
import { images, imageMaterials } from '../db/schema.ts';
import { IImage } from '../Interfaces.ts';
import { getDbInstance } from '../db/connection.ts';

export class ImageModel {
    private db: PostgresJsDatabase<typeof schema>;
  
    constructor(connectionString?: string) {
      this.db = getDbInstance(connectionString);
    }
  
    public async getImages() {
      return await this.db.select().from(images);
    }
  
    async getImageById(id: string) {
      const result = await this.db.select().from(images).where(eq(images.id, id));
      return result[0];
    }
  
    async getImagesByCategoryId(categoryId: string) {
      return await this.db.select().from(images).where(eq(images.category_id, categoryId));
    }

  public async createImage(data: IImage) {
    const imageId = data.id ?? globalThis.crypto.randomUUID();

    const materialIds = data.materials && data.materials.length
      ? data.materials.map((m) => m.id)
      : null;

    const categoryId = data.category?.id ?? null;

    // Run inserts inside a transaction for atomicity
    const insertedImages = await this.db.transaction(async (tx) => {
      const { id, url, title, description, price, amountAvailable, category, ...rest } = data;
      const [inserted] = await tx.insert(images).values({
        id: imageId,
        url,
        title,
        description: description ?? null,
        category_id: categoryId ?? null,
        price: price ?? null,
        amount_available: amountAvailable ?? null,
        ...rest,
      }).returning();

      if (materialIds && materialIds.length) {
        const rows = materialIds.map((mid) => ({
          id: globalThis.crypto.randomUUID(),
          image_id: imageId,
          material_id: mid,
        }));
        await tx.insert(imageMaterials).values(rows).returning();
      }

      return inserted;
    });

    return insertedImages;
  }
}