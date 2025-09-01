import { RouterContext } from "../dependencies.ts";
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

      const mimeType = file.type;

      const imageId = globalThis.crypto.randomUUID();

      const newImage: IImage = {
        id: imageId,
        title: imageName,
        imageData: fileContent, 
        mimeType: mimeType,     
        description: imageDescription || undefined,
        category: categoryId ? { id: categoryId, name: "" } : null,
        price: price,
        amountAvailable: amountAvailable,
        materials: materials ?? undefined,
      };

      const model = new ImageModel();
      const saved = await model.createImage(newImage);

      const savedId = saved?.id ?? newImage.id;

      const { ...responseBody } = newImage;

      context.response.status = 201;
      context.response.body = { ...responseBody, id: savedId };

    } catch (err) {
      console.error("Error during image upload:", err);
      context.response.status = 500;
      context.response.body = { error: "An internal server error occurred.", message: (err instanceof Error) ? err.message : String(err) };
    }
  }

  public static async fetchAllImages({ response }: RouterContext<string>): Promise<void> {
    try {
      const allImages = await ImageModel.getImages();

      response.body = allImages;
    } catch (err) {
      console.log(err);
      response.status = 500;
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      response.body = { error: "Internal Server Error", message: errorMessage };
    }
  }

  public static async getImageById({ response, params }: RouterContext<string>): Promise<void> {
    const { imageId } = params;

    if (!imageId) {
      response.status = 400;
      response.body = { error: "Missing imageId parameter" };
      return;
    }

    try {
      const image = await ImageModel.getImageById(imageId);

      if (!image || !(image.image_data instanceof Uint8Array) || !image.mime_type) {
        response.status = 404;
        response.body = { error: "Image not found or data is incomplete" };
        return;
      }

      response.headers.set("Content-Type", image.mime_type);

      response.status = 200;
      response.body = image.image_data;

    } catch (error) {
      console.error("Error fetching image by ID:", error);
      response.status = 500;
      response.body = { error: "Internal server error" };
    }
  }
}

export default ImageService;
