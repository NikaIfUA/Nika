import { RouterContext } from "../dependencies.ts";
import { STORAGE_PATH, URL } from "../env.ts";
import { IImage } from "../Interfaces.ts";
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
    const imageId = globalThis.crypto.randomUUID();
    const fileExtension = originalFilename.split('.').pop() || 'png';
    const filename = `${imageName}.${fileExtension}`;

    const storageDir = join(STORAGE_PATH, 'images');
    const filePath = join(storageDir, filename);

    await Deno.mkdir(storageDir, { recursive: true });

    await Deno.writeFile(filePath, fileContent);
    console.log(`Image saved to ${filePath}`);

    const newImage: IImage = {
      id: imageId,
      url: `${URL}${STORAGE_PATH}/images/${filename}`,
      title: imageName,
      description: imageDescription,
      categoryId: categoryId || undefined,
      price: price || undefined,
      amountAvailable: amountAvailable || undefined,
      materialsIds: materialsIds || undefined
    };

    // --- TEMPORARY LOGGING ---
    // This will log the image metadata to your console instead of saving to a database.
    console.log("\n--- Image Metadata (Ready for DB) ---");
    console.log(JSON.stringify(newImage, null, 2)); // Pretty-prints the JSON object
    console.log("-------------------------------------\n");
    // --- END OF LOGGING ---

    return newImage;
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