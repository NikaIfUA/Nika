import { RouterContext } from '../dependencies.ts';
import { createTechnology, deleteTechnology, getTechnologies, getTechnologyBySlug, updateTechnology } from '../db/crud/technologyCrud.ts';
import { generateSlug, createWithUniqueSlug } from '../util/slug.ts';
import ImageService from './imageService.ts';
import { IImage } from '../Interfaces.ts';
import ImageCrud from '../db/crud/imageCrud.ts';
import InfoTreeService from './infoTreeService.ts';

class TechnologyService {
  public static async saveTechnology({ request, response }: RouterContext<string>): Promise<void> {
    try {
      const body = request.body;
      if (body.type() !== "form-data") {
        response.status = 415;
        response.body = { error: 'Unsupported Media Type. Expected multipart/form-data' };
        return;
      }

      const formData = await body.formData();
      const name = formData.get("name") as string;
      const description = formData.get("description") as string | undefined;
      const parentIdRaw = formData.get("parentId") as string | null;
      const imageFile = formData.get("image") as File | null;
      const parentId = parentIdRaw && parentIdRaw.trim() ? parentIdRaw.trim() : null;

      if (!name || !name.trim()) {
        response.status = 400;
        response.body = { error: 'Technology name is required' };
        return;
      }

      let technologyImage: IImage | null = null;
      if (imageFile) {
        const imageData = await ImageService.saveImage(imageFile, description);
        // Save image to database
        const imageCrud = new ImageCrud();
        technologyImage = await imageCrud.createImage(imageData);
      }

      const slug = generateSlug(name);
      
      if (!slug) {
        response.status = 400;
        response.body = { error: 'Technology name must contain valid characters for URL' };
        return;
      }

      const newTechnology = await createWithUniqueSlug(
        slug,
        (finalSlug) => createTechnology({
          id: globalThis.crypto.randomUUID(),
          name: name.trim(),
          slug: finalSlug,
          description: description && description.trim() ? description.trim() : undefined,
          imageId: technologyImage?.id,
          parentId,
        })
      );

      await InfoTreeService.invalidateInfoTreeCache().catch((error) => {
        console.warn('technology cache invalidate failed:', error);
      });
      response.status = 201;
      response.body = newTechnology;
      return;
    } catch (err) {
      console.error('saveTechnology error:', err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      
      // Check for duplicate slug error
      if (String(errorMessage).includes('duplicate') && String(errorMessage).includes('slug')) {
        response.status = 409;
        response.body = { error: 'A technology with this name already exists' };
        return;
      }
      
      response.status = 500;
      response.body = { error: 'Unable to save technology', details: errorMessage };
    }
  }

  public static async getTechnologies({ response }: RouterContext<string>): Promise<void> {
    try {
      const technologies = await getTechnologies();
      response.body = technologies;
    } catch (err) {
      console.log(err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      if (String(errorMessage).includes('relation') && String(errorMessage).includes('does not exist')) {
        response.status = 200;
        response.body = [];
        return;
      }
      response.status = 500;
      response.body = { error: "Internal Server Error", message: errorMessage };
    }
  }

  public static async getTechnologyBySlug({ params, response }: RouterContext<string>): Promise<void> {
    try {
      const slug = params.slug;
      const technology = await getTechnologyBySlug(slug);

      if (!technology) {
        response.status = 404;
        response.body = { error: "Technology not found" };
        return;
      }

      response.body = technology;
    } catch (err) {
      console.error('getTechnologyBySlug error:', err);
      response.status = 500;
      response.body = { error: 'Unable to fetch technology' };
    }
  }

  public static async updateTechnology({ params, request, response }: RouterContext<string>): Promise<void> {
    try {
      const technologyId = params.id;
      const body = request.body;

      if (body.type() !== "form-data") {
        response.status = 415;
        response.body = { error: 'Unsupported Media Type. Expected multipart/form-data' };
        return;
      }

      const formData = await body.formData();
      const name = formData.get("name") as string;
      const description = formData.get("description") as string | undefined;
      const parentIdRaw = formData.get("parentId") as string | null;
      const imageFile = formData.get("image") as File | null;
      const parentId = parentIdRaw && parentIdRaw.trim() ? parentIdRaw.trim() : null;

      if (!name || !name.trim()) {
        response.status = 400;
        response.body = { error: "Technology name is required" };
        return;
      }

      let technologyImage: IImage | undefined;
      if (imageFile) {
        const imageData = await ImageService.saveImage(imageFile, description);
        // Save image to database
        const imageCrud = new ImageCrud();
        technologyImage = await imageCrud.createImage(imageData);
      }

      const updateData: any = {
        name: name.trim(),
        description: description && description.trim() ? description.trim() : undefined,
        parentId,
      };

      if (technologyImage) {
        updateData.imageId = technologyImage.id;
      }

      const updatedTechnology = await updateTechnology(technologyId, updateData);

      if (!updatedTechnology) {
        response.status = 404;
        response.body = { error: "Technology not found" };
        return;
      }

      await InfoTreeService.invalidateInfoTreeCache().catch((error) => {
        console.warn('technology cache invalidate failed:', error);
      });
      response.status = 200;
      response.body = updatedTechnology;

    } catch (err) {
      console.error('updateTechnology error:', err);
      response.status = 500;
      response.body = { error: 'Unable to update technology' };
    }
  }

  public static async deleteTechnology({ params, response }: RouterContext<string>): Promise<void> {
    try {
      const technologyId = params.id;
      const success = await deleteTechnology(technologyId);

      if (!success) {
        response.status = 404;
        response.body = { error: "Technology not found" };
        return;
      }

      await InfoTreeService.invalidateInfoTreeCache().catch((error) => {
        console.warn('technology cache invalidate failed:', error);
      });
      response.status = 200;
      response.body = { message: "Technology deleted successfully" };

    } catch (err) {
      console.error('deleteTechnology error:', err);
      response.status = 500;
      response.body = { error: 'Unable to delete technology' };
    }
  }
}

export default TechnologyService;
