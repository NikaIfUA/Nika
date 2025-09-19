import { RouterContext } from "../dependencies.ts";
import { STORAGE_PATH } from "../env.ts";
import { IImage } from "../Interfaces.ts";
import { Database } from "../db/crud.ts";
import { join } from "../dependencies.ts";

class ImageService {
  private static getMimeType(ext: string) {
    switch (ext) {
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  public static async fetchImageById({ response, params }: RouterContext<string>): Promise<void> {
    try {
      const id = params.id;

      const db = new Database();
      const image = await db.getImageById(id);
      if (!image) {
        response.status = 404;
        response.body = { error: 'Image metadata not found' };
        return;
      }

      const parts = image.url.split('/');
      const fileName = parts.pop() ?? '';
      const fileBytes = await Deno.readFile(image.url);

      const ext = fileName.split('.').pop() ?? '';
      const mime = ImageService.getMimeType(ext);
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
      const allImages = await db.getImages();

      // Read all image files and collect them in an array
      const imagesData: Array<IImage & { fileName: string; mimeType: string; data: Uint8Array }> = [];
      for (const img of allImages) {
        const parts = img.url.split('/');
        const fileName = parts.pop() ?? '';
        const filePath = join(STORAGE_PATH, 'images', fileName);
        const fileBytes = await Deno.readFile(filePath);
        const ext = fileName.split('.').pop() ?? '';
        const mime = ImageService.getMimeType(ext);
        imagesData.push({
          ...img,
          fileName,
          mimeType: mime,
          data: fileBytes
        });
      }

      response.headers.set('Content-Type', 'application/json');
      response.body = imagesData;
    } catch (err) {
      console.error("Failed to get images metadata:", err);
      response.status = 500;
      response.body = { error: "Could not retrieve image list" };
    }
  }

  public static async uploadHandler(context: RouterContext<string>) {
    try {
      const body = context.request.body;

      if (body.type() !== "form-data") {
        context.response.status = 415; // Wrong file type
        context.response.body = { error: "Request body must be multipart/form-data." };
        return;
      }
      
      const formData = await body.formData();
      const file = formData.get("imageFile") as File | null;
      const imageName = formData.get("imageName") as string || "No image name provided";
      const imageDescription = formData.get("imageDescription") as string;
      const categoryId = formData.get("categoryId") as string || null;
      const priceValue = formData.get("price");
      const price = priceValue !== null ? Number(priceValue.toString()) : null;
      const amountAvailableValue = formData.get("amountAvailable");
      const amountAvailable = amountAvailableValue !== null ? Number(amountAvailableValue.toString()) : null;
      const materialIdsValue = formData.get("materialIds");
      let materials: string[] = [];

      if (typeof materialIdsValue === "string") {
        try {
          materials = JSON.parse(materialIdsValue);
          if (!Array.isArray(materials)) {
            materials = [materialIdsValue];
          }
        } catch {
          materials = [materialIdsValue];
        }
      }

      if (!file) {
        context.response.status = 400;
        context.response.body = { error: "Image file is missing." };
        return;
      }

      const fileContent = new Uint8Array(await file.arrayBuffer());
      
      const fileExtension = file.name.split('.').pop();
      const filename = `${imageName}.${fileExtension}`;

      const storageDir = join(STORAGE_PATH, 'images');
      const filePath = join(storageDir, filename);

      await Deno.mkdir(storageDir, { recursive: true });

      await Deno.writeFile(filePath, fileContent);
      console.log(`Image saved to ${filePath}`);

      const newImage: IImage = {
        id: globalThis.crypto.randomUUID(),
        url: `${STORAGE_PATH}images/${filename}`,
        title: imageName,
        description: imageDescription,
        category: categoryId ? { id: categoryId, name: "" } : null,
        price: price !== null ? price : undefined,
        amountAvailable: amountAvailable !== null ? amountAvailable : undefined,
        materials: materials && materials.length
          ? materials.map((id) => ({ id, name: "" }))
          : undefined
      };

      let savedImage: IImage;
      try {
        const db = new Database();
        const saved = await db.createImage(newImage);

        savedImage = {
          ...newImage,
          id: saved?.id ?? newImage.id,
        } as IImage;
      } catch (err) {
        console.error('Failed to save image metadata to DB:', err);
        savedImage = newImage;
      }

      context.response.status = 201;
      context.response.body = savedImage;

    } catch (error) {
      console.error("Error during image upload:", error);
      context.response.status = 500;
      context.response.body = { error: "An internal server error occurred." };
    }
  }
}

export default ImageService;
