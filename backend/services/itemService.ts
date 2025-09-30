import { RouterContext } from "../dependencies.ts";
import { Database } from "../db/crud.ts";
import { STORAGE_PATH } from "../env.ts";

class ItemService {
  public static async fetchItems({ response }: RouterContext<string>): Promise<void> {
    try {
  const db = new Database();
  const items = await db.getItems();
      // Return lightweight items for listing (avoid heavy nested data if needed)
      response.body = items.map((it: any) => {
        // determine cover image url if available
        let coverImageUrl: string | null = null;
        try {
          if (Array.isArray(it.images) && it.images.length) {
            const coverId = it.coverImage;
            const cover = coverId ? it.images.find((i: any) => i.id === coverId) : null;
            coverImageUrl = (cover && cover.url) ? cover.url : (it.images[0]?.url ?? null);
          }
        } catch (_) {
          coverImageUrl = null;
        }

        return { id: it.id, title: it.title, coverImageUrl };
      });
    } catch (err) {
      console.error(err);
      response.status = 500;
      response.body = { error: 'Internal Server Error', message: (err instanceof Error) ? err.message : String(err) };
    }
  }

  public static async fetchItemImage({ response, params }: RouterContext<string>): Promise<void> {
    try {
      const id = params.id;
      const db = new Database();
      const item = await db.getItemById(id);
      if (!item) {
        response.status = 404;
        response.body = { error: 'Not Found' };
        return;
      }

      const image = (item.images && item.images.length) ? item.images.find((i: any) => i.id === item.coverImage) ?? item.images[0] : null;
      if (!image) {
        response.status = 404;
        response.body = { error: 'Image Not Found' };
        return;
      }

      // If url is local path (starts with STORAGE_PATH) serve file, otherwise redirect to URL
      const url: string = image.url;
      if (url.startsWith(STORAGE_PATH)) {
        try {
          const file = await Deno.readFile(url);
          response.status = 200;
          response.headers.set('Content-Type', image.mimeType || 'application/octet-stream');
          response.body = file;
          return;
        } catch (err) {
          console.error('Failed to read file:', err);
          response.status = 500;
          response.body = { error: 'Failed to read image file' };
          return;
        }
      }

      // external URL — redirect
      response.status = 302;
      response.headers.set('Location', url);
    } catch (err) {
      console.error(err);
      response.status = 500;
      response.body = { error: 'Internal Server Error', message: (err instanceof Error) ? err.message : String(err) };
    }
  }
}

export default ItemService;
