import { RouterContext } from "../dependencies.ts";
import { IItem, IImage } from "../Interfaces.ts";
import ItemCrud from "../db/crud/itemCrud.ts";
import ImageService from "./imageService.ts"; // Now used for fetching files

class ItemService {
  // getMimeType and readImageFile methods have been REMOVED from here.

  public static async fetchItems({ response }: RouterContext<string>): Promise<void> {
    try {
      const db = new ItemCrud();
      const items = await db.getItems();
      response.status = 200;
      response.body = items;
    } catch (err) {
      console.error("fetchItems error:", err);
      response.status = 500;
      response.body = { error: "Could not retrieve items" };
    }
  }

  public static async fetchItemById({ response, params }: RouterContext<string>): Promise<void> {
    try {
      const db = new ItemCrud();
      const item = await db.getItemById(params.id);
      if (item) {
        response.status = 200;
        response.body = item;
      } else {
        response.status = 404;
        response.body = { error: "Item not found" };
      }
    } catch (err) {
      console.error("fetchItemById error:", err);
      response.status = 500;
      response.body = { error: "Could not retrieve item" };
    }
  }

  public static async fetchItemImage({ response, params }: RouterContext<string>): Promise<void> {
    try {
      const db = new ItemCrud();
      const item = await db.getItemById(params.id);

      if (!item || !item.coverImage) {
        response.status = 404;
        response.body = { error: 'Item or cover image not found' };
        return;
      }

      const coverImageRecord = item.images.find(img => img.id === item.coverImage);
      if (!coverImageRecord) {
        response.status = 404;
        response.body = { error: 'Cover image record not found' };
        return;
      }

      const { fileBytes, mime } = await ImageService.readImageFile(coverImageRecord.url);

      response.headers.set('Content-Type', mime);
      response.body = fileBytes;

    } catch (err) {
      console.error('fetchItemImage error:', err);
      response.status = 500;
      if (err instanceof Deno.errors.NotFound) {
        response.status = 404;
        response.body = { error: 'Image file not found on disk' };
      } else {
        response.body = { error: 'Unable to read image file' };
      }
    }
  }

  public static async createItem(context: RouterContext<string>): Promise<void> {
    try {
      const body = context.request.body;
      if (body.type() !== "form-data") {
        context.response.status = 415;
        context.response.body = { error: "Request body must be multipart/form-data." };
        return;
      }

      const formData = await body.formData();
      const file = formData.get("newImages") as File | null;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const categoryId = formData.get("categoryId") as string | null;
      const price = Number(formData.get("price"));
      const amountAvailable = Number(formData.get("amountAvailable"));
      const materialIds: string[] = JSON.parse(formData.get("materialIds") as string || '[]');

      if (!file) {
        context.response.status = 400;
        context.response.body = { error: "Image file is missing." };
        return;
      }

      const preparedImage: IImage = await ImageService.saveImage(file, description);

      const newItemData: IItem = {
        id: globalThis.crypto.randomUUID(),
        title: title,
        description: description,
        category: categoryId ? { id: categoryId, name: "" } : null,
        price: isNaN(price) ? null : price,
        amountAvailable: isNaN(amountAvailable) ? null : amountAvailable,
        materials: materialIds.map(id => ({ id, name: "" })),
        images: [preparedImage], // Use the prepared image object
        coverImage: preparedImage.id,
      };

      const db = new ItemCrud();
      const savedItem = await db.createItem(newItemData);

      context.response.status = 201;
      context.response.body = savedItem;

    } catch (error) {
      console.error("Error during item creation:", error);
      context.response.status = 500;
      context.response.body = { error: "An internal server error occurred." };
    }
  }
}

export default ItemService;