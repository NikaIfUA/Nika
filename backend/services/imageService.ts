import { RouterContext } from "../dependencies.ts";
import { STORAGE_PATH } from "../env.ts";
import { IImage } from "../Interfaces.ts";
import { getImageById, getImages, createImage } from "../db/crud/imageCrud.ts";
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

  private static async readImageFile(fileUrl: string) {
    const parts = fileUrl.split('/');
    const fileName = parts.pop() ?? '';
    const filePath = fileUrl.startsWith(STORAGE_PATH)
      ? fileUrl
      : join(STORAGE_PATH, 'images', fileName);

    const fileBytes = await Deno.readFile(filePath);
    const ext = fileName.split('.').pop() ?? '';
    const mime = ImageService.getMimeType(ext);

    return { fileName, filePath, fileBytes, mime } as {
      fileName: string;
      filePath: string;
      fileBytes: Uint8Array;
      mime: string;
    };
  }

  public static async fetchImageById({ response, params }: RouterContext<string>): Promise<void> {
    try {
      const id = params.id;

  const image = await getImageById(id);
      if (!image) {
        response.status = 404;
        response.body = { error: 'Image metadata not found' };
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
  const allImages = await getImages();

      // Read all image files and collect them in an array
      const imagesData: Array<IImage & { fileName: string; mimeType: string; data: Uint8Array }> = [];
      for (const img of allImages) {
        const { fileName, fileBytes, mime } = await ImageService.readImageFile(img.url);
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
        const saved = await createImage(newImage);

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
