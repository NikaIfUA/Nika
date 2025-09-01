import { PostgresJsDatabase } from '../dependencies.ts';
import { eq } from 'drizzle-orm/';
import * as schema from '../db/schema.ts';
import { images, imageMaterials } from '../db/schema.ts';
import { IImage } from '../Interfaces.ts';
import { getDbInstance } from '../db/connection.ts';

export class ImageModel {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(connectionString?: string) {
    this.db = getDbInstance(connectionString);
  }

  public static async getImages() {
    const db = getDbInstance();
    return await db.select({
      id: images.id,
      title: images.title,
      description: images.description,
      price: images.price,
      amountAvailable: images.amount_available,
      categoryId: images.category_id,
      mimeType: images.mime_type
    }).from(images);
  }

  public static async getImageById(id: string) {
    const db = getDbInstance();
    const result = await db.select().from(images).where(eq(images.id, id));
    return result[0];
  }

  public static async getImagesByCategoryId(categoryId: string) {
    const db = getDbInstance();
    return await db.select({
      id: images.id,
      title: images.title,
      description: images.description,
      price: images.price,
      amountAvailable: images.amount_available,
      categoryId: images.category_id,
      mimeType: images.mime_type
    }).from(images).where(eq(images.category_id, categoryId));
  }

  public async createImage(data: IImage) {
    // 1. Перевірка наявності обов'язкових даних
    if (!data.imageData || !data.mimeType) {
      throw new Error("Image data and MIME type are required to create an image.");
    }

    // 2. Генерація унікального ID на стороні сервера
    const imageId = globalThis.crypto.randomUUID();

    const insertedImage = await this.db.transaction(async (tx) => {

      // 3. Явне створення об'єкта для вставки, використовуючи лише потрібні поля
      const [inserted] = await tx.insert(images).values({
        id: imageId,
        image_data: data.imageData as Uint8Array,
        title: data.title as string,
        description: data.description as string | null,
        price: data.price != null ? String(data.price) : null,
        amount_available: data.amountAvailable != null ? data.amountAvailable : null,
        category_id: data.category?.id != null ? String(data.category.id) : null,
        mime_type: data.mimeType as string
      }).returning();

      // 4. Обробка пов'язаних матеріалів
      if (data.materials && data.materials.length > 0) {
        const materialRows = data.materials.map((material) => ({
          id: globalThis.crypto.randomUUID(),
          image_id: imageId,
          material_id: material.id,
        }));
        await tx.insert(imageMaterials).values(materialRows);
      }

      return inserted;
    });

    return insertedImage;
  }
}

export default ImageModel;
