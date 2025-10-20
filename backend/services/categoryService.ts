import { RouterContext } from '../dependencies.ts';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from '../db/crud/categoryCrud.ts';

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
      try {
        const txt = await body.text();
        const parsed = txt ? JSON.parse(txt) : {};
        name = parsed?.name ? String(parsed.name) : '';
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

      const newCategory = await createCategory({ id: globalThis.crypto.randomUUID(), name: name.trim() });

      response.status = 201;
      response.body = newCategory;
    } catch (err) {
      console.error('saveCategory error:', err);
      response.status = 500;
      response.body = { error: 'Unable to save category' };
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
      const { name } = await body.json();

      if (!name || !name.trim()) {
        response.status = 400;
        response.body = { error: "Category name is required" };
        return;
      }

      const updatedCategory = await updateCategory(categoryId, name.trim());

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