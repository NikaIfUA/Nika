import { RouterContext } from "../dependencies.ts";
import { STORAGE_PATH } from "../env.ts";
import { IImage } from "../Interfaces.ts";
import Database from "../db/crud/imageCrud.ts";
import { join } from "../dependencies.ts";

class ImageService {
  private static getMimeType(ext: string) {
    switch (ext) {
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      default: return 'image/jpeg';
    }
  }

  public static async readImageFile(fileUrl: string) {
    const parts = fileUrl.split('/');
    const fileName = parts.pop() ?? '';
    const filePath = fileUrl.startsWith(STORAGE_PATH)
      ? fileUrl
      : join(STORAGE_PATH, 'images', fileName);
    const fileBytes = await Deno.readFile(filePath);
    const ext = fileName.split('.').pop() ?? '';
    const mime = ImageService.getMimeType(ext);
    return { fileName, filePath, fileBytes, mime };
  }

  public static async fetchImageById({ response, params }: RouterContext<string>): Promise<void> {
    try {
      const id = params.id;
      const db = new Database();
      const image = await db.getImageById(id);

      if (!image || !image.url) {
        response.status = 404;
        response.body = { error: 'Image not found' };
        return;
      }

      const { fileBytes, mime } = await ImageService.readImageFile(image.url);
      response.headers.set('Content-Type', mime);
      response.body = fileBytes;
    } catch (err) {
      console.error('fetchImageById error:', err);
      response.status = 500;
      response.body = { error: 'Unable to read image' };
    }
  }

  public static async fetchAllImages({ response }: RouterContext<string>): Promise<void> {
    try {
      const db = new Database();
      const allImages = await db.getAllImages();

      response.status = 200;
      response.body = allImages;
    } catch (err) {
      console.error("Failed to get images metadata:", err);
      response.status = 500;
      response.body = { error: "Could not retrieve image list" };
    }
  }

  public static async uploadHandler(ctx: RouterContext<string>) {
    try {
      const body = ctx.request.body;
      if (body.type() !== "form-data") {
        ctx.response.status = 415; // Unsupported Media Type
        ctx.response.body = { error: "Request must be multipart/form-data." };
        return;
      }

      const formData = await body.formData();
      const file = formData.get("imageFile") as File | null;
      const description = formData.get("description") as string | undefined;

      if (!file) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Image file is missing." };
        return;
      }

      const savedImage = await ImageService.saveImage(file, description);

      ctx.response.status = 201; // Created
      ctx.response.body = savedImage;

    } catch (error) {
      console.error("Error during image upload:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "An internal server error occurred." };
    }
  }

  public static async saveImage(file: File, description?: string): Promise<IImage> {
    try {
      const fileContent = new Uint8Array(await file.arrayBuffer());
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const newFilename = `${globalThis.crypto.randomUUID()}.${fileExtension}`;
      const storageDir = join(STORAGE_PATH, 'images');
      const filePath = join(storageDir, newFilename);

      await Deno.mkdir(storageDir, { recursive: true });
      await Deno.writeFile(filePath, fileContent);
      console.log(`Image saved to ${filePath}`);

      const newImageData: IImage = {
        id: globalThis.crypto.randomUUID(), // Generate ID here
        url: filePath,
        description: description,
        resolution: { width: 0, height: 0 },
        mimeType: file.type,
        weight: file.size,
      };

      return newImageData;

    } catch (error) {
      console.error("Error during image file saving:", error);
      throw new Error("Failed to save image file.");
    }
  }
}

export default ImageService;
