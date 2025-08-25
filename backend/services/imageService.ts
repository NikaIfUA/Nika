import { RouterContext, join } from "../dependencies.ts";
import { STORAGE_PATH, URL } from "../env.ts";
import { IImage } from "../Interfaces.ts";
import { ImageModel } from "../models/image.ts";

class ImageService {
  public static async uploadHandler(context: RouterContext<string>) {
    try {
      const body = context.request.body;

      if (body.type() !== "form-data") {
        context.response.status = 415;
        context.response.body = { error: "Request body must be multipart/form-data." };
        return;
      }

      const formData = await body.formData();
      const file = formData.get("imageFile") as File | null;
      const imageName = (formData.get("imageName") as string);
      const imageDescription = (formData.get("imageDescription") as string) || "";
      const categoryId = (formData.get("categoryId") as string) || null;
      const priceValue = formData.get("price");
      const price = priceValue !== null ? Number(priceValue.toString()) : undefined;
      const amountAvailableValue = formData.get("amountAvailable");
      const amountAvailable = amountAvailableValue !== null ? Number(amountAvailableValue.toString()) : null;
      const materialIdsValue = formData.get("materialIds");
      let materials: { id: string; name: string }[] | undefined = undefined;  

      if (typeof materialIdsValue === "string") {
        try {
          const parsed = JSON.parse(materialIdsValue);
          if (Array.isArray(parsed)) materials = parsed.map((id: string) => ({ id, name: "" }));
          else materials = [{ id: String(parsed), name: "" }];
        } catch {
          materials = [{ id: String(materialIdsValue), name: "" }];
        }
      }

      if (!file) {
        context.response.status = 400;
        context.response.body = { error: "Image file is missing." };
        return;
      }

      const fileContent = new Uint8Array(await file.arrayBuffer());
      const fileExtension = file.name.split('.').pop() || 'png';
      const filename = `${imageName}.${fileExtension}`;

      const storageDir = join(STORAGE_PATH, 'images');
      const filePath = join(storageDir, filename);

      await Deno.mkdir(storageDir, { recursive: true });
      await Deno.writeFile(filePath, fileContent);

      // Build IImage and persist via model
      const imageId = globalThis.crypto.randomUUID();
      const newImage: IImage = {
        id: imageId,
        url: `${URL}${STORAGE_PATH}images/${filename}`,
        title: imageName,
        description: imageDescription || undefined,
        category: categoryId ? { id: categoryId, name: "" } : null,
        price: price,
        amountAvailable: amountAvailable,
        materials: materials ?? undefined,
      };

      const model = new ImageModel();
      const saved = await model.createImage(newImage);

      context.response.status = 201;
      context.response.body = { ...newImage, id: saved?.id ?? newImage.id } as IImage;
    } catch (err) {
      console.error("Error during image upload:", err);
      context.response.status = 500;
      context.response.body = { error: "An internal server error occurred.", message: (err instanceof Error) ? err.message : String(err) };
    }
  }
}

export default ImageService;
