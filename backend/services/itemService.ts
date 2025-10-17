import { RouterContext } from "../dependencies.ts";
import { IItem, IImage } from "../Interfaces.ts";
import ItemCrud from "../db/crud/itemCrud.ts";
import ImageService from "./imageService.ts";
import ImageCrud from "../db/crud/imageCrud.ts";

class ItemService {
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
      const files = formData.getAll("newImages") as File[];
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const categoryId = formData.get("categoryId") as string | null;
      const price = Number(formData.get("price"));
      const amountAvailable = Number(formData.get("amountAvailable"));
      const materialIds: string[] = JSON.parse(formData.get("materialIds") as string || '[]');

      if (!files || files.length === 0) {
        context.response.status = 400;
        context.response.body = { error: "At least one image file is required." };
        return;
      }

      const imageSavePromises = files.map(file => ImageService.saveImage(file, description));
      const preparedImages: IImage[] = await Promise.all(imageSavePromises);

      const newItemData: IItem = {
        id: globalThis.crypto.randomUUID(),
        title: title,
        description: description,
        category: categoryId ? { id: categoryId, name: "" } : null,
        price: isNaN(price) ? null : price,
        amountAvailable: isNaN(amountAvailable) ? null : amountAvailable,
        materials: materialIds.map(id => ({ id, name: "" })),
        images: preparedImages,
        coverImage: preparedImages.length > 0 ? preparedImages[0].id : '',
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

  public static async fetchItemImagesById({ response, params }: RouterContext<string>): Promise<void> {
    try {
      const { itemId, imageId } = params;

      if (!itemId || !imageId) {
        response.status = 400;
        response.body = { error: 'Item ID and Image ID are required' };
        return;
      }

      const imageDb = new ImageCrud();
      const imageRecord = await imageDb.getImageRecordById(imageId);

      if (!imageRecord || imageRecord.item_id !== itemId) {
        response.status = 404;
        response.body = { error: 'Image not found for this item' };
        return;
      }

      const { fileBytes, mime } = await ImageService.readImageFile(imageRecord.url);
      response.headers.set('Content-Type', mime);
      response.body = fileBytes;

    } catch (err) {
      console.error('fetchSpecificItemImage error:', err);
      response.status = 500;
      response.body = { error: 'Unable to read image file' };
    }
  }

  public static async updateItem(context: RouterContext<string>): Promise<void> {
    try {
      const itemId = context.params.id;
      if (!itemId) {
        context.response.status = 400;
        context.response.body = { error: "Item ID is required in the URL." };
        return;
      }

      const body = context.request.body;
      if (body.type() !== "form-data") {
        context.response.status = 415;
        context.response.body = { error: "Request body must be multipart/form-data." };
        return;
      }

      const formData = await body.formData();
      const files = formData.getAll("newImages") as File[];
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const categoryId = formData.get("categoryId") as string
      const price = Number(formData.get("price"));
      const amountAvailable = Number(formData.get("amountAvailable"));
      const materialIds: string[] = JSON.parse(formData.get("materialIds") as string || '[]');
      const existingImageIds: string[] = JSON.parse(formData.get("existingImageIds") as string || '[]');

      const db = new ItemCrud();
      const existingItem = await db.getItemById(itemId);

      if (!existingItem) {
        context.response.status = 404;
        context.response.body = { error: "Item not found." };
        return;
      }

      let preparedImages: IImage[] = [];
      if (files && files.length > 0) {
        const imageSavePromises = files.map(file => ImageService.saveImage(file, description));
        preparedImages = await Promise.all(imageSavePromises);
      }

      const updatedItemData: IItem = {
        id: itemId,
        title: title || existingItem.title,
        description: description || existingItem.description,
        category: categoryId ? { id: categoryId, name: "" } : existingItem.category,
        price: isNaN(price) ? existingItem.price : price,
        amountAvailable: isNaN(amountAvailable) ? existingItem.amountAvailable : amountAvailable,
        materials: materialIds.length > 0 ? materialIds.map(id => ({ id, name: "" })) : existingItem.materials,
        images: [...(existingItem.images.filter(img => existingImageIds.includes(img.id))), ...preparedImages],
        coverImage: existingItem.coverImage,
      };

      const savedItem = await db.updateItem(itemId, updatedItemData);
      if (savedItem) {
        context.response.status = 200;
        context.response.body = savedItem;
      } else {
        context.response.status = 500;
        context.response.body = { error: "Failed to update item." };
      }
    } catch (error) {
      console.error("Error during item update:", error);
      context.response.status = 500;
      context.response.body = { error: "An internal server error occurred." };
    }
  }

  public static async deleteItem(context: RouterContext<string>): Promise<void> {
    try {
      const itemId = context.params.id;
      if (!itemId) {
        context.response.status = 400;
        context.response.body = { error: "Item ID is required in the URL." };
        return;
      }
      const db = new ItemCrud();
      const existingItem = await db.getItemById(itemId);
      if (!existingItem) {
        context.response.status = 404;
        context.response.body = { error: "Item not found." };
        return;
      }

      await db.deleteItem(itemId);
      context.response.status = 204;
    } catch (error) {
      console.error("Error during item deletion:", error);
      context.response.status = 500;
      context.response.body = { error: "An internal server error occurred." };
    }
  }
}

export default ItemService;