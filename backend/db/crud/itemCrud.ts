import { getDbInstance } from '../connection.ts';
import { items, images, categories, materials, imageMaterials } from '../schema.ts';
import * as schema from '../schema.ts';
import { eq, inArray } from 'npm:drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { IItem, ICategory, IMaterial, IImage } from '../../Interfaces.ts';

export default class Database {
  private db: NodePgDatabase<typeof schema>;

  constructor() {
    this.db = getDbInstance();
  }

  public async getItems(): Promise<IItem[]> {
    const itemRows = await this.db.select().from(items);
    if (!itemRows.length) {
      return [];
    }
    return await this.mapRowsToItems(itemRows);
  }

  public async getItemById(id: string): Promise<IItem | undefined> {
    const itemRows = await this.db.select().from(items).where(eq(items.id, id)).limit(1);
    if (!itemRows.length) {
      return undefined;
    }
    const result = await this.mapRowsToItems(itemRows);
    return result[0];
  }

  public async createItem(itemData: IItem): Promise<IItem | undefined> {
    const newItemId = itemData.id;

    await this.db.transaction(async (tx) => {
      await tx.insert(items).values({
        id: newItemId,
        title: itemData.title,
        description: itemData.description,
        price: itemData.price,
        amount_available: itemData.amountAvailable,
        category_id: itemData.category?.id ?? null,
      });

      const newImages = itemData.images;
      if (newImages && newImages.length > 0) {
        const imageValues = newImages.map(img => ({
          id: img.id,
          url: img.url,
          description: img.description,
          resolution_width: img.resolution.width,
          resolution_height: img.resolution.height,
          mime_type: img.mimeType,
          weight: img.weight,
          item_id: newItemId,
        }));
        await tx.insert(images).values(imageValues);

        const coverImageId = newImages[0].id;
        await tx.update(items)
          .set({ cover_image_id: coverImageId })
          .where(eq(items.id, newItemId));

        const materialIds = itemData.materials?.map(mat => mat.id) ?? [];
        if (materialIds.length > 0) {
          const imageMaterialValues: { id: string; image_id: string; material_id: string }[] = [];

          for (const image of newImages) {
            for (const materialId of materialIds) {
              imageMaterialValues.push({
                id: globalThis.crypto.randomUUID(),
                image_id: image.id,
                material_id: materialId,
              });
            }
          }

          if (imageMaterialValues.length > 0) {
            await tx.insert(imageMaterials).values(imageMaterialValues);
          }
        }
      }
    });

    return this.getItemById(newItemId);
  }

  private async mapRowsToItems(itemRows: (typeof items.$inferSelect)[]): Promise<IItem[]> {
    const itemIds = itemRows.map(it => it.id);
    if (!itemIds.length) return [];

    const allImagesForItems = await this.db.select().from(images).where(inArray(images.item_id, itemIds));
    const imagesByItemId = new Map<string, (typeof images.$inferSelect)[]>();
    for (const image of allImagesForItems) {
      if (!image.item_id) continue;
      const existing = imagesByItemId.get(image.item_id) ?? [];
      existing.push(image);
      imagesByItemId.set(image.item_id, existing);
    }

    const categoryIds = itemRows.map(it => it.category_id).filter((id): id is string => !!id);
    const allCategories = categoryIds.length > 0
      ? await this.db.select().from(categories).where(inArray(categories.id, categoryIds))
      : [];
    const categoriesMap = new Map(allCategories.map(cat => [cat.id, cat]));

    const allImageIds = allImagesForItems.map(img => img.id);
    const imageMaterialRelations = allImageIds.length > 0
      ? await this.db.select().from(imageMaterials).where(inArray(imageMaterials.image_id, allImageIds))
      : [];
    const materialIds = imageMaterialRelations.map(rel => rel.material_id);
    const allMaterials = materialIds.length > 0
      ? await this.db.select().from(materials).where(inArray(materials.id, materialIds))
      : [];
    const materialsMap = new Map(allMaterials.map(mat => [mat.id, mat]));

    const materialsByImageId = new Map<string, (typeof materials.$inferSelect)[]>();
    for (const relation of imageMaterialRelations) {
      const material = materialsMap.get(relation.material_id);
      if (material) {
        const existing = materialsByImageId.get(relation.image_id) ?? [];
        existing.push(material);
        materialsByImageId.set(relation.image_id, existing);
      }
    }

    return itemRows.map(row => {
      const itemImageRecords = imagesByItemId.get(row.id) || [];
      const allMaterialsForItem = new Map<string, IMaterial>();

      const itemImages: IImage[] = itemImageRecords.map(imgRecord => {
        (materialsByImageId.get(imgRecord.id) || []).forEach(mat => {
          const materialObject: IMaterial = { id: mat.id, name: mat.name };
          allMaterialsForItem.set(mat.id, materialObject);
        });

        return {
          id: imgRecord.id,
          url: imgRecord.url,
          description: imgRecord.description ?? undefined,
          resolution: { width: imgRecord.resolution_width ?? 0, height: imgRecord.resolution_height ?? 0 },
          mimeType: imgRecord.mime_type,
          weight: imgRecord.weight
        };
      });

      const categoryRecord = row.category_id ? categoriesMap.get(row.category_id) : null;
      const category: ICategory | null = categoryRecord ? { id: categoryRecord.id, name: categoryRecord.name } : null;

      const item: IItem = {
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        amountAvailable: row.amount_available,
        coverImage: row.cover_image_id ?? '',
        images: itemImages,
        category: category,
        materials: Array.from(allMaterialsForItem.values()),
      };

      return item;
    });
  }

  public async updateItem(id: string, itemData: Partial<IItem>): Promise<IItem | undefined> {
    const existingItem = await this.getItemById(id);
    if (!existingItem) {
      return undefined;
    }

    const updatedItem = { ...existingItem, ...itemData };
    await this.db.update(items).set(updatedItem).where(eq(items.id, id));
    return this.getItemById(id);
  }

  public async deleteItem(id: string): Promise<boolean> {
    const deleteResult = await this.db.delete(items).where(eq(items.id, id));
    return deleteResult > 0;
  }
}