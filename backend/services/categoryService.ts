import { RouterContext } from '../dependencies.ts';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from '../db/crud/categoryCrud.ts';
import { generateSlug, generateSlugSuffix } from '../util/slug.ts';

class CategoryService {
  /**
   * Saves a new category to the database.
   */
  public static async saveCategory({ request, response }: RouterContext<string>): Promise<void> {
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
        response.body = { error: 'Category name is required' };
        return;
      }

      const slug = generateSlug(name);
      
      if (!slug) {
        response.status = 400;
        response.body = { error: 'Category name must contain valid characters for URL' };
        return;
      }

      let finalSlug = slug;
      let retries = 0;
      const maxRetries = 5;

      while (retries < maxRetries) {
        try {
          const newCategory = await createCategory({ 
            id: globalThis.crypto.randomUUID(), 
            name: name.trim(),
            slug: finalSlug,
            description: description && description.trim() ? description.trim() : undefined
          });

          response.status = 201;
          response.body = newCategory;
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
      response.body = { error: 'Unable to create unique slug for this category name' };
      return;
    } catch (err) {
      console.error('saveCategory error:', err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      
      // Check for duplicate slug error
      if (String(errorMessage).includes('duplicate') && String(errorMessage).includes('slug')) {
        response.status = 409;
        response.body = { error: 'A category with this name already exists' };
        return;
      }
      
      response.status = 500;
      response.body = { error: 'Unable to save category', details: errorMessage };
    }
  }

  /**
   * Retrieves all categories from the database.
   */
  public static async getCategories({ response }: RouterContext<string>): Promise<void> {
    try {
      const categories = await getCategories();
      response.body = categories;
    } catch (err) {
      console.log(err);
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      // If the relation doesn't exist, return empty array instead of 500 so frontend can proceed
      if (String(errorMessage).includes('relation') && String(errorMessage).includes('does not exist')) {
        response.status = 200;
        response.body = [];
        return;
      }
      response.status = 500;
      response.body = { error: "Internal Server Error", message: errorMessage };
    }
  }

  public static async updateCategory({ params, request, response }: RouterContext<string>): Promise<void> {
    try {
      const categoryId = params.id;
      const body = request.body;
      const { name, description } = await body.json();

      if (!name || !name.trim()) {
        response.status = 400;
        response.body = { error: "Category name is required" };
        return;
      }

      const updatedCategory = await updateCategory(categoryId, { 
        name: name.trim(),
        description: description ? description.trim() : undefined
      });

      if (!updatedCategory) {
        response.status = 404;
        response.body = { error: "Category not found" };
        return;
      }

      response.status = 200;
      response.body = updatedCategory;

    } catch (err) {
      console.error('updateCategory error:', err);
      response.status = 500;
      response.body = { error: 'Unable to update category' };
    }
  }

  public static async deleteCategory({ params, response }: RouterContext<string>): Promise<void> {
    try {
      const categoryId = params.id;
      const success = await deleteCategory(categoryId);

      if (!success) {
        response.status = 404;
        response.body = { error: 'Category not found' };
        return;
      }

      response.status = 204;

    } catch (err) {
      console.error('deleteCategory error:', err);
      response.status = 500;
      response.body = { error: 'Unable to delete category' };
    }
  }
}

export default CategoryService;