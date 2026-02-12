import { RouterContext } from '../dependencies.ts';
import { createMaterial, deleteMaterial, getMaterials, updateMaterial } from '../db/crud/materialCrud.ts';
import { generateSlug, createWithUniqueSlug } from '../util/slug.ts';
import ImageService from './imageService.ts';
import { IImage } from '../Interfaces.ts';
import ImageCrud from '../db/crud/imageCrud.ts';

class MaterialService {
  public static async saveMaterial({ request, response }: RouterContext<string>): Promise<void> {
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
      const imageFile = formData.get("image") as File | null;

      if (!name || !name.trim()) {
        response.status = 400;
        response.body = { error: 'Material name is required' };
        return;
      }

      const slug = generateSlug(name);
      
      if (!slug) {
        response.status = 400;
        response.body = { error: 'Material name must contain valid characters for URL' };
        return;
      }

      let materialImage: IImage | null = null;
      if (imageFile) {
        const imageData = await ImageService.saveImage(imageFile, description);
        const imageCrud = new ImageCrud();
        materialImage = await imageCrud.createImage(imageData);
      }

      const newMaterial = await createWithUniqueSlug(
        slug,
        (finalSlug) => createMaterial({
          id: globalThis.crypto.randomUUID(),
          name: name.trim(),
          slug: finalSlug,
          description: description && description.trim() ? description.trim() : undefined,
          imageId: materialImage?.id
        })
      );

      response.status = 201;
      response.body = newMaterial;
      return;
    } catch (err) {
      console.error('saveMaterial error:', err);
      response.status = 500;
      response.body = { error: 'Unable to save material' };
    }
  }


  public static async getMaterials({ response }: RouterContext<string>): Promise<void> {
    try {
    const materials = await getMaterials();
    response.body = materials;
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

  public static async updateMaterial({ params, request, response }: RouterContext<string>): Promise<void> {
    try {
      const materialId = params.id;
      const body = request.body;
      if (body.type() !== "form-data") {
        response.status = 415;
        response.body = { error: 'Unsupported Media Type. Expected multipart/form-data' };
        return;
      }

      const formData = await body.formData();
      const name = formData.get("name") as string;
      const description = formData.get("description") as string | undefined;
      const imageFile = formData.get("image") as File | null;

      if (!name || !name.trim()) {
        response.status = 400;
        response.body = { error: "Material name is required" };
        return;
      }

      let materialImage: IImage | undefined;
      if (imageFile) {
        const imageData = await ImageService.saveImage(imageFile, description);
        const imageCrud = new ImageCrud();
        materialImage = await imageCrud.createImage(imageData);
      }

      const updateData: any = {
        name: name.trim(),
        description: description && description.trim() ? description.trim() : undefined
      };

      if (materialImage) {
        updateData.imageId = materialImage.id;
      }

      const updatedMaterial = await updateMaterial(materialId, updateData);

      if (!updatedMaterial) {
        response.status = 404;
        response.body = { error: "Material not found" };
        return;
      }

      response.status = 200;
      response.body = updatedMaterial;

    } catch (err) {
      console.error('updateMaterial error:', err);
      response.status = 500;
      response.body = { error: 'Unable to update material' };
    }
  }

  public static async deleteMaterial({ params, response }: RouterContext<string>): Promise<void> {
    try {
      const materialId = params.id;

      const success = await deleteMaterial(materialId);

      if (!success) {
        response.status = 404;
        response.body = { error: 'Material not found' };
        return;
      }

      response.status = 200;
      response.body = { message: "Material deleted successfully" };

    } catch (err) {
      console.error('deleteMaterial error:', err);
      response.status = 500;
      response.body = { error: 'Unable to delete material' };
    }
  }
}

export default MaterialService;
