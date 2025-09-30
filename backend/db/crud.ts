import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, inArray } from 'drizzle-orm/';
import * as schema from './schema.ts'; // Import all schemas
import { categories, items, images, materials, imageMaterials } from './schema.ts';
import { IItem } from '../Interfaces.ts';
import { getDbInstance } from './connection.ts';

export class Database {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(connectionString?: string) {
    this.db = getDbInstance(connectionString);
  }

  async getItems() {
    const rows = await this.db.select().from(items);
    return await this.mapImageRowsToIItem(rows);
  }

  async getItemById(id: string) {
    const result = await this.db.select().from(items).where(eq(items.id, id));
    const rows = result;
    const mapped = await this.mapImageRowsToIItem(rows);
    return mapped[0];
  }

  async getItemsByCategoryId(categoryId: string) {
    const rows = await this.db.select().from(items).where(eq(items.category_id, categoryId));
    return await this.mapImageRowsToIItem(rows);
  }


  async getCategories() {
    return await this.db.select().from(categories);
  }

  async getMaterials() {
    return await this.db.select().from(materials);
  }

  async createItem(data: IItem) {
    const itemId = data.id ?? globalThis.crypto.randomUUID();

    const materialIds = data.materials && data.materials.length
      ? data.materials.map((m) => m.id)
      : [] as string[];

    const categoryId = data.category?.id ?? null;

    // Run inserts inside a transaction for atomicity
    await this.db.transaction(async (tx) => {
      // Insert item metadata
      await tx.insert(items).values({
        id: itemId,
        title: data.title,
        description: data.description ?? null,
        category_id: categoryId,
        price: data.price ?? null,
        amount_available: data.amountAvailable ?? null,
      }).returning();

      // Insert images (single table stores item_id, position and file metadata)
      const imagesToInsert = (data.images ?? []).map((img: any, idx: number) => ({
        id: img.id ?? globalThis.crypto.randomUUID(),
        item_id: itemId,
        url: img.url,
        description: img.description ?? null,
        resolution_width: img.resolution?.width ?? null,
        resolution_height: img.resolution?.height ?? null,
        mime_type: img.mimeType,
        weight: img.weight ?? null,
        position: idx,
      }));

      if (imagesToInsert.length) {
        await tx.insert(images).values(imagesToInsert).returning();

        // set cover_image_id to first image if present
        await tx.update(items).set({ cover_image_id: imagesToInsert[0].id }).where(eq(items.id, itemId)).returning();

        // Insert image-material links for the newly created images (if materials provided)
        if (materialIds.length) {
          const imageMaterialRows = [] as { id: string; image_id: string; material_id: string }[];
          for (const f of imagesToInsert) {
            for (const mid of materialIds) {
              imageMaterialRows.push({ id: globalThis.crypto.randomUUID(), image_id: f.id, material_id: mid });
            }
          }
          if (imageMaterialRows.length) {
            await tx.insert(imageMaterials).values(imageMaterialRows).returning();
          }
        }
      }
    });

    // Return the created item in IItem shape
    return await this.getItemById(itemId);
  }

  // Helper: convert image rows to IItem[] with categories and materials loaded in batches
  private async mapImageRowsToIItem(rows: any[]): Promise<IItem[]> {
    if (!rows || !rows.length) return [];

    const categoryIds = Array.from(new Set(rows.map((r) => r.category_id).filter(Boolean)));
    const categoriesRows = categoryIds.length
      ? await this.db.select().from(categories).where(inArray(categories.id, categoryIds))
      : [];
    const categoriesMap = new Map(categoriesRows.map((c: any) => [c.id, c]));

    const itemIds = rows.map((r) => r.id);

    // Load images rows (images table now contains item_id and position)
    const imageRows = itemIds.length
      ? await this.db.select().from(images).where(inArray(images.item_id, itemIds))
      : [];
    const imageMap = new Map(imageRows.map((f: any) => [f.id, f]));

    // Load image-materials for these images
    const imageIds = Array.from(new Set(imageRows.map((r: any) => r.id)));
    const imageMaterialRows = imageIds.length
      ? await this.db.select().from(imageMaterials).where(inArray(imageMaterials.image_id, imageIds))
      : [];

    const materialIds = Array.from(new Set(imageMaterialRows.map((im: any) => im.material_id)));
    const materialRows = materialIds.length
      ? await this.db.select().from(materials).where(inArray(materials.id, materialIds))
      : [];
    const materialMap = new Map(materialRows.map((m: any) => [m.id, m]));

    // group image_materials by image_id
    const imageToMaterialIds = new Map<string, string[]>();
    for (const im of imageMaterialRows) {
      const arr = imageToMaterialIds.get(im.image_id) ?? [];
      arr.push(im.material_id);
      imageToMaterialIds.set(im.image_id, arr);
    }

    // group images by item_id, ordered by position
    const itemToImageRefs = new Map<string, { id: string; position: number }[]>();
    for (const img of imageRows) {
      if (!img.item_id) continue; // skip orphan images
      const arr = itemToImageRefs.get(img.item_id) ?? [];
      arr.push({ id: img.id, position: img.position ?? 0 });
      itemToImageRefs.set(img.item_id, arr);
    }

    return rows.map((row) => {
      const imageRefs = (itemToImageRefs.get(row.id) ?? []).sort((a, b) => a.position - b.position);
      const images = imageRefs.map((ref) => {
        const f = imageMap.get(ref.id);
        if (!f) return null;
        const _mats = (imageToMaterialIds.get(f.id) ?? []).map((mid) => materialMap.get(mid)).filter(Boolean);
        return {
          id: f.id,
          url: f.url,
          description: f.description ?? undefined,
          resolution: { width: f.resolution_width ?? 0, height: f.resolution_height ?? 0 },
          mimeType: f.mime_type,
          weight: f.weight ?? null,
        } as any;
      }).filter(Boolean) as any[];

      // Aggregate materials across item images (unique)
      const matsSet = new Map<string, any>();
      for (const ref of imageRefs) {
        const fId = ref.id;
        const mids = imageToMaterialIds.get(fId) ?? [];
        for (const mid of mids) {
          const m = materialMap.get(mid);
          if (m) matsSet.set(m.id, m);
        }
      }
      const mats = Array.from(matsSet.values());

      const item: IItem = {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        category: categoriesMap.get(row.category_id) ?? null,
        price: row.price ?? null,
        amountAvailable: row.amount_available ?? null,
        materials: mats.length ? mats : null,
        images: images,
        coverImage: row.cover_image_id ?? (images[0]?.id ?? ''),
      };
      return item;
    });
  }
}
