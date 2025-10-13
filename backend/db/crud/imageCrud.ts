import { getDbInstance } from '../connection.ts';
import { images } from '../schema.ts'; // Assuming 'images' is your Drizzle schema for the images table
import { eq } from 'npm:drizzle-orm';
import type { IImage } from '../../Interfaces.ts';

export default class ImageCrud {
  private db;

  constructor() {
    this.db = getDbInstance();
  }

  /**
   * Maps a database row to an IImage object.
   */
  private mapRowToIImage(row: any): IImage {
    return {
      id: row.id,
      url: row.url,
      description: row.description ?? undefined,
      resolution: { width: row.width, height: row.height },
      mimeType: row.mime_type,
      weight: row.weight ?? null,
    };
  }

  /**
   * Retrieves a single image by its ID.
   */
  public async getImageById(id: string): Promise<IImage | undefined> {
    const [row] = await this.db.select().from(images).where(eq(images.id, id)).limit(1);
    return row ? this.mapRowToIImage(row) : undefined;
  }

  public async getAllImages(): Promise<IImage[]> {
    const rows = await this.db.select().from(images);
    return rows.map(this.mapRowToIImage);
  }

  /**
   * Inserts a new image record into the database.
   * This method now correctly accepts an IImage object.
   */
  public async createImage(imageData: IImage): Promise<IImage> {
    await this.db.insert(images).values({
      id: imageData.id,
      url: imageData.url,
      description: imageData.description,
      width: imageData.resolution.width,
      height: imageData.resolution.height,
      mime_type: imageData.mimeType,
      weight: imageData.weight,
    });

    // Return the object that was passed in, as it represents the data now in the DB.
    return imageData;
  }
}