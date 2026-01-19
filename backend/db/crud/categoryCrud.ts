import { eq } from 'npm:drizzle-orm';
import { getDbInstance } from '../connection.ts';
import { categories } from '../schema.ts';

export async function createCategory(data: { id: string; name: string; slug: string; description?: string }) {
  const db = getDbInstance();
  return await db.insert(categories).values(data).returning().then((res) => res[0]);
}

export async function getCategories() {
  const db = getDbInstance();
  return await db.select().from(categories);
}

export async function updateCategory(id: string, data: { name: string; description?: string }) {
  const db = getDbInstance();
  return await db.update(categories).set(data).where(eq(categories.id, id)).returning().then((res) => res[0]);
}

export async function deleteCategory(id: string) {
  const db = getDbInstance();
  const result = await db.delete(categories).where(eq(categories.id, id));
  return result;
}
