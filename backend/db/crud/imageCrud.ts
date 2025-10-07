import { getDbInstance } from '../connection.ts';
import { images, categories, materials, imageMaterials } from '../schema.ts';
import { eq, inArray } from 'drizzle-orm';
import type { IImage } from '../../Interfaces.ts';

async function mapImageRowsToIImage(db: any, rows: any[]): Promise<IImage[]> {
  if (!rows || !rows.length) return [];

  const categoryIds = Array.from(new Set(rows.map((r) => r.category_id).filter(Boolean)));
  const categoriesRows = categoryIds.length
    ? await db.select().from(categories).where(inArray(categories.id, categoryIds))
    : [];
  const categoriesMap = new Map(categoriesRows.map((c: any) => [c.id, c]));

  const imageIds = rows.map((r) => r.id);
  const imageMaterialRows = imageIds.length
    ? await db.select().from(imageMaterials).where(inArray(imageMaterials.image_id, imageIds))
    : [];

  const materialIds = Array.from(new Set(imageMaterialRows.map((im: any) => im.material_id)));
  const materialRows = materialIds.length
    ? await db.select().from(materials).where(inArray(materials.id, materialIds))
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
      category: (categoriesMap.get(row.category_id) as any) ?? null,
      materials: mats.length ? (mats as any) : null,
    };
    return img;
  });
}

export async function getImages() {
  const db = getDbInstance();
  const rows = await db.select().from(images);
  return await mapImageRowsToIImage(db, rows);
}

export async function getImageById(id: string) {
  const db = getDbInstance();
  const rows = await db.select().from(images).where(eq(images.id, id)).limit(1);
  const row = rows[0];
  if (!row) return undefined;
  const result = await mapImageRowsToIImage(db, [row]);
  return result[0];
}

export async function getImagesByCategoryId(categoryId: string) {
  const db = getDbInstance();
  const rows = await db.select().from(images).where(eq(images.category_id, categoryId));
  return await mapImageRowsToIImage(db, rows);
}

export async function createImage(data: IImage) {
  const db = getDbInstance();
  const imageId = data.id ?? globalThis.crypto.randomUUID();

  const materialIds = data.materials && data.materials.length
    ? data.materials.map((m) => m.id)
    : null;

  const categoryId = data.category?.id ?? null;

  await db.transaction(async (tx) => {
    const { id: _id, url, title, description, price, amountAvailable, category: _category, ...rest } = data as any;
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

  return await getImageById(imageId);
}
