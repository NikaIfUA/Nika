import { getDbInstance } from '../connection.ts';
import { categories } from '../schema.ts';

export async function createCategory(data: { id: string; name: string }) {
  const db = getDbInstance();
  return await db.insert(categories).values(data).returning().then((res) => res[0]);
}

export async function getCategories() {
  const db = getDbInstance();
  return await db.select().from(categories);
}
