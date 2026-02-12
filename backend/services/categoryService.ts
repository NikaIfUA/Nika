import { RouterContext } from '../dependencies.ts';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from '../db/crud/categoryCrud.ts';
import { generateSlug, createWithUniqueSlug } from '../util/slug.ts';
import ImageService from './imageService.ts';
import { IImage } from '../Interfaces.ts';
import ImageCrud from '../db/crud/imageCrud.ts';

class CategoryService {
  /**
   * Saves a new category to the database.
   */
  public static async saveCategory({ request, response }: RouterContext<string>): Promise<void> {
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
        response.body = { error: 'Category name is required' };
        return;
      }

      const slug = generateSlug(name);
      
      if (!slug) {
        response.status = 400;
        response.body = { error: 'Category name must contain valid characters for URL' };
        return;
      }

      let categoryImage: IImage | null = null;
      if (imageFile) {
        const imageData = await ImageService.saveImage(imageFile, description);
        const imageCrud = new ImageCrud();
        categoryImage = await imageCrud.createImage(imageData);
      }

      const newCategory = await createWithUniqueSlug(
        slug,
        (finalSlug) => createCategory({
          id: globalThis.crypto.randomUUID(),
          name: name.trim(),
          slug: finalSlug,
          description: description && description.trim() ? description.trim() : undefined,
          imageId: categoryImage?.id,
        })
      );

      response.status = 201;
      response.body = newCategory;
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
        response.body = { error: "Category name is required" };
        return;
      }

      let categoryImage: IImage | undefined;
      if (imageFile) {
        const imageData = await ImageService.saveImage(imageFile, description);
        const imageCrud = new ImageCrud();
        categoryImage = await imageCrud.createImage(imageData);
      }

      const updateData: any = {
        name: name.trim(),
        description: description && description.trim() ? description.trim() : undefined
      };

      if (categoryImage) {
        updateData.imageId = categoryImage.id;
      }

      const updatedCategory = await updateCategory(categoryId, updateData);

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

      response.status = 200;
      response.body = { message: "Category deleted successfully" };

    } catch (err) {
      console.error('deleteCategory error:', err);
      response.status = 500;
      response.body = { error: 'Unable to delete category' };
    }
  }
}

export default CategoryService;