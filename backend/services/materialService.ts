import { RouterContext } from '../dependencies.ts';
import { createMaterial, deleteMaterial, getMaterials, updateMaterial } from '../db/crud/materialCrud.ts';
import { generateSlug, generateSlugSuffix } from '../util/slug.ts';

class MaterialService {
  public static async saveMaterial({ request, response }: RouterContext<string>): Promise<void> {
    try {
      // Require JSON payload for this endpoint
      const contentType = request.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        response.status = 415;
        response.body = { error: 'Unsupported Media Type. Expected application/json' };
        return;
      }

      const body = request.body;
      let name = '';
      let description = '';
      try {
        const txt = await body.text();
        const parsed = txt ? JSON.parse(txt) : {};
        name = parsed?.name ? String(parsed.name) : '';
        description = parsed?.description ? String(parsed.description) : '';
      } catch (_e) {
        response.status = 400;
        response.body = { error: 'Invalid JSON payload' };
        return;
      }

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

      let finalSlug = slug;
      let retries = 0;
      const maxRetries = 5;

      while (retries < maxRetries) {
        try {
          const newMaterial = await createMaterial({ 
            id: globalThis.crypto.randomUUID(), 
            name: name.trim(),
            slug: finalSlug,
            description: description && description.trim() ? description.trim() : undefined
          });

          response.status = 201;
          response.body = newMaterial;
          return;
        } catch (createErr) {
          const errorMsg = String(createErr);
          if (errorMsg.includes('duplicate') && errorMsg.includes('slug')) {
            // Slug already exists, add a suffix and retry
            finalSlug = `${slug}-${generateSlugSuffix()}`;
            retries++;
          } else {
            // Different error, throw it
            throw createErr;
          }
        }
      }

      // If we get here, we couldn't create after retries
      response.status = 409;
      response.body = { error: 'Unable to create unique slug for this material name' };
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
      const { name, description } = await body.json();

      if (!name || !name.trim()) {
        response.status = 400;
        response.body = { error: "Material name is required" };
        return;
      }

      const updatedMaterial = await updateMaterial(materialId, { 
        name: name.trim(),
        description: description ? description.trim() : undefined
      });

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

      if (success) {
        response.status = 404;
        response.body = { error: 'Material not found' };
        return;
      }

      response.status = 204;

    } catch (err) {
      console.error('deleteMaterial error:', err);
      response.status = 500;
      response.body = { error: 'Unable to delete material' };
    }
  }
}

export default MaterialService;
