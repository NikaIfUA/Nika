import { getDbInstance } from '../connection.ts';
import { materials } from '../schema.ts';

export async function createMaterial(data: { id: string; name: string }) {
  const db = getDbInstance();
  return await db.insert(materials).values(data).returning().then((res) => res[0]);
}

export async function getMaterials() {
  const db = getDbInstance();
  return await db.select().from(materials);
}
