import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, inArray } from 'drizzle-orm/';
import * as schema from './schema.ts'; // Import all schemas
import { categories, images, materials, imageMaterials } from './schema.ts';
import { IImage } from '../Interfaces.ts';
import { getDbInstance } from './connection.ts';

export class Database {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(connectionString?: string) {
    this.db = getDbInstance(connectionString);
  }

  async getImages() {
  const rows = await this.db.select().from(images);
  return await this.mapImageRowsToIImage(rows);
  }

  async getImageById(id: string) {
    const rows = await this.db.select().from(images).where(eq(images.id, id)).limit(1);
    const row = rows[0];
    if (!row) return undefined;

    // Fetch category if present
    const categoryRows = row.category_id
      ? await this.db.select().from(categories).where(eq(categories.id, row.category_id)).limit(1)
      : [];
    const category = categoryRows[0] ?? null;

    // Fetch material IDs from the join table, then load materials
    const imageMaterialRows = await this.db.select().from(imageMaterials).where(eq(imageMaterials.image_id, id));
    const materialIds = imageMaterialRows.map((r) => r.material_id).filter(Boolean);
    const materialRows = materialIds.length
      ? await this.db.select().from(materials).where(inArray(materials.id, materialIds))
      : [];

    const image: IImage = {
      id: row.id,
      url: row.url,
      title: row.title,
      description: row.description ?? undefined,
      price: row.price ?? null,
      amountAvailable: row.amount_available ?? null,
      category: category,
      materials: materialRows.length ? materialRows : null,
    };

    return image;
  }

  async getImagesByCategoryId(categoryId: string) {
    const rows = await this.db.select().from(images).where(eq(images.category_id, categoryId));
    return await this.mapImageRowsToIImage(rows);
  }


  async getCategories() {
    return await this.db.select().from(categories);
  }

  async getMaterials() {
    return await this.db.select().from(materials);
  }

  async createImage(data: IImage) {
    const imageId = data.id ?? globalThis.crypto.randomUUID();

    const materialIds = data.materials && data.materials.length
      ? data.materials.map((m) => m.id)
      : null;

    const categoryId = data.category?.id ?? null;

    // Run inserts inside a transaction for atomicity
    await this.db.transaction(async (tx) => {
      const { id: _id, url, title, description, price, amountAvailable, category: _category, ...rest } = data;
      await tx.insert(images).values({
        id: imageId,
        url,
        title,
        description: description,
        category_id: categoryId,
        price: price,
        amount_available: amountAvailable,
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
    });

    // Return the created image in IImage shape
    return await this.getImageById(imageId);
  }

  // Helper: convert image rows to IImage[] with categories and materials loaded in batches
  private async mapImageRowsToIImage(rows: any[]): Promise<IImage[]> {
    if (!rows || !rows.length) return [];

    const categoryIds = Array.from(new Set(rows.map((r) => r.category_id).filter(Boolean)));
    const categoriesRows = categoryIds.length
      ? await this.db.select().from(categories).where(inArray(categories.id, categoryIds))
      : [];
    const categoriesMap = new Map(categoriesRows.map((c: any) => [c.id, c]));

    const imageIds = rows.map((r) => r.id);
    const imageMaterialRows = imageIds.length
      ? await this.db.select().from(imageMaterials).where(inArray(imageMaterials.image_id, imageIds))
      : [];

    const materialIds = Array.from(new Set(imageMaterialRows.map((im: any) => im.material_id)));
    const materialRows = materialIds.length
      ? await this.db.select().from(materials).where(inArray(materials.id, materialIds))
      : [];
    const materialMap = new Map(materialRows.map((m: any) => [m.id, m]));

    const imageToMaterialIds = new Map<string, string[]>();
    for (const im of imageMaterialRows) {
      const arr = imageToMaterialIds.get(im.image_id) ?? [];
      arr.push(im.material_id);
      imageToMaterialIds.set(im.image_id, arr);
    }

    return rows.map((row) => {
      const mats = (imageToMaterialIds.get(row.id) ?? []).map((mid) => materialMap.get(mid)).filter(Boolean);
      const img: IImage = {
        id: row.id,
        url: row.url,
        title: row.title,
        description: row.description ?? undefined,
        price: row.price ?? null,
        amountAvailable: row.amount_available ?? null,
        category: categoriesMap.get(row.category_id) ?? null,
        materials: mats.length ? mats : null,
      };
      return img;
    });
  }

  async createCategory(data: { id: string; name: string }) {
    return await this.db.insert(categories).values(data).returning().then((res) => res[0]);
  }

  async createMaterial(data: { id: string; name: string }) {
    return await this.db.insert(materials).values(data).returning().then((res) => res[0]);
  }
}
