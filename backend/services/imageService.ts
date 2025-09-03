import { RouterContext } from "../dependencies.ts";
import { STORAGE_PATH, URL } from "../env.ts";
import { IImage } from "../Interfaces.ts";
import { Database } from "../db/crud.ts";
import { join } from "../dependencies.ts";

class ImageService {
  private static async saveImage(
    fileContent: Uint8Array,
    originalFilename: string,
    imageName: string,
    imageDescription: string,
    categoryId: string | null,
    price: number | null,
    amountAvailable: number | null,
    materialsIds: string[] | null
  ): Promise<IImage> {
    const fileExtension = originalFilename.split('.').pop();
    const filename = `${imageName}.${fileExtension}`;

    const storageDir = join(STORAGE_PATH, 'images');
    const filePath = join(storageDir, filename);

    await Deno.mkdir(storageDir, { recursive: true });

    await Deno.writeFile(filePath, fileContent);
    console.log(`Image saved to ${filePath}`);

    const newImage: IImage = {
      id: "temp-id",
      url: `${URL}${STORAGE_PATH}images/${filename}`,
      title: imageName,
      description: imageDescription,
      category: categoryId ? { id: categoryId, name: "" } : null,
      price: price !== null ? price : undefined,
      amountAvailable: amountAvailable !== null ? amountAvailable : undefined,
      materials: materialsIds && materialsIds.length
        ? materialsIds.map((id) => ({ id, name: "" }))
        : undefined
    };

    // Persist to DB
    try {
      const db = new Database();
      const saved = await db.createImage(newImage);

      // Return the saved DB row (with DB-generated values) merged with our in-memory newImage
      return {
        ...newImage,
        id: saved?.id ?? newImage.id,
      } as IImage;
    } catch (err) {
      console.error('Failed to save image metadata to DB:', err);
      // Fallback to returning the metadata object even if DB save failed
      return newImage;
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
      const newImage = await ImageService.saveImage(
        fileContent,
        file.name,
        imageName,
        imageDescription,
        categoryId,
        price,
        amountAvailable,
        materials
      );

      context.response.status = 201;
      context.response.body = newImage;

    } catch (error) {
      console.error("Error during image upload:", error);
      context.response.status = 500;
      context.response.body = { error: "An internal server error occurred." };
    }
  }
}

export default ImageService;
