import { getDbInstance } from '../connection.ts';
import { materials } from '../schema.ts';
import { eq } from 'npm:drizzle-orm';

export async function createMaterial(data: { id: string; name: string }) {
  const db = getDbInstance();
  return await db.insert(materials).values(data).returning().then((res) => res[0]);
}

export async function getMaterials() {
  const db = getDbInstance();
  return await db.select().from(materials);
}

export async function updateMaterial(id: string, name: string) {
  const db = getDbInstance();
  const result = await db.update(materials).set({ name }).where(eq(materials.id, id)).returning().then((res) => res[0]);
  return result;
}

export async function deleteMaterial(id: string) {
  const db = getDbInstance();
  const deletedItems = await db.delete(materials).where(eq(materials.id, id));
  return deletedItems[0];
}
