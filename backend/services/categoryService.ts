import { RouterContext } from '../dependencies.ts';
import { getDbInstance } from '../db/connection.ts';
import { categories } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export class CategoryService {
  public static async saveCategory(context: RouterContext<string>) {
    try {
      // 1. Виправлено: Отримання тіла запиту як властивості
      // Перевіряємо, чи є тіло у запиті взагалі
      if (!context.request.hasBody) {
        context.response.status = 400;
        context.response.body = { error: 'Request body is required.' };
        return;
      }

      const body = context.request.body;

      // Перевіряємо, чи тип тіла - JSON
      if (body.type() !== 'json') {
        context.response.status = 415; // Unsupported Media Type
        context.response.body = { error: 'Request must be in JSON format.' };
        return;
      }

      // Отримуємо дані з тіла запиту
      const { name } = await body.json();

      // 2. Валідація вхідних даних (залишається без змін)
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        context.response.status = 400; // Bad Request
        context.response.body = { error: 'Поле "name" є обов\'язковим.' };
        return;
      }

      const categoryName = name.trim();
      const db = getDbInstance();

      const existingCategory = await db.select().from(categories).where(eq(categories.name, categoryName));
      if (existingCategory.length > 0) {
        context.response.status = 409; // Conflict
        context.response.body = { error: 'Категорія з такою назвою вже існує.' };
        return;
      }

      // 3. Виправлено: Генеруємо 'id', оскільки схема цього вимагає
      const newCategory = {
        id: globalThis.crypto.randomUUID(), // Повертаємо генерацію UUID
        name: categoryName,
      };

      // Передаємо повний об'єкт `newCategory` для збереження
      const [insertedCategory] = await db.insert(categories).values(newCategory).returning();

      context.response.status = 201;
      context.response.body = {
        message: 'Категорію успішно створено!',
        data: insertedCategory,
      };

    } catch (err) {
      console.error('Error saving category:', err);
      context.response.status = 500;
      context.response.body = { error: 'Внутрішня помилка сервера.' };
    }
  }
}

export default CategoryService;