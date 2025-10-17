import { getDbInstance } from '../connection.ts';
import { images } from '../schema.ts';
import { eq } from 'npm:drizzle-orm';
import type { IImage } from '../../Interfaces.ts';

export default class ImageCrud {
  private db;

  constructor() {
    this.db = getDbInstance();
  }

  private mapRowToIImage(row: typeof images.$inferSelect): IImage {
    return {
      id: row.id,
      url: row.url,
      description: row.description ?? undefined,
      resolution: {
        width: row.resolution_width ?? 0,
        height: row.resolution_height ?? 0
      },
      mimeType: row.mime_type,
      weight: row.weight ?? null,
    };
  }

  public async getImageById(id: string): Promise<IImage | undefined> {
    const [row] = await this.db.select().from(images).where(eq(images.id, id)).limit(1);
    return row ? this.mapRowToIImage(row) : undefined;
  }

  public async getImageRecordById(id: string): Promise<(typeof images.$inferSelect) | undefined> {
    const [row] = await this.db.select().from(images).where(eq(images.id, id)).limit(1);
    return row;
  }

  public async getAllImages(): Promise<IImage[]> {
    const rows = await this.db.select().from(images);
    return rows.map(this.mapRowToIImage);
  }

  public async createImage(imageData: IImage): Promise<IImage> {
    await this.db.insert(images).values({
      id: imageData.id,
      url: imageData.url,
      description: imageData.description,
      resolution_width: imageData.resolution.width,
      resolution_height: imageData.resolution.height,
      mime_type: imageData.mimeType,
      weight: imageData.weight,
    });

    return imageData;
  }
}