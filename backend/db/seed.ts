import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import { categories, images, materials, imageMaterials, items } from './schema.ts';
import { ICategory, IMaterial } from '../Interfaces.ts';
import "https://deno.land/std@0.224.0/dotenv/load.ts";

console.log('Seeding started...');

const connectionString = Deno.env.get("DB_URL");
if (!connectionString) {
  throw new Error("DB_URL environment variable is not set!");
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log('Clearing existing data...');
  // Delete in safe order and continue on errors (e.g. relation doesn't exist)
  const deletes: { name: string; action: () => Promise<unknown> }[] = [
    { name: 'images', action: () => db.delete(images) },
    { name: 'image_materials', action: () => db.delete(imageMaterials) },
    { name: 'items', action: () => db.delete(items) },
    { name: 'categories', action: () => db.delete(categories) },
    { name: 'materials', action: () => db.delete(materials) },
  ];

  for (const d of deletes) {
    try {
      await d.action();
      console.log(`Cleared table: ${d.name}`);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      // If the relation doesn't exist, log and continue. Otherwise log and continue as well.
      if (msg.includes("does not exist") && msg.includes('relation')) {
        console.log(`Table ${d.name} does not exist, skipping delete.`);
      } else {
        console.log(`Warning: failed to clear ${d.name}:`, msg);
      }
    }
  }
  console.log('Seeding categories...');
  const categoriesSeed: ICategory[] = [
    { id: 'cat_01', name: 'Nature' },
    { id: 'cat_02', name: 'Architecture' },
    { id: 'cat_03', name: 'Animals' },
  ];

  const materialsSeed: IMaterial[] = [
    { id: 'mat_01', name: 'Cotton' },
    { id: 'mat_02', name: 'Wood' },
    { id: 'mat_03', name: 'Metal' },
  ];


  // Insert categories
  const insertedCategories = await db.insert(categories).values(categoriesSeed).returning();
  console.log('Seeded categories:', insertedCategories);

  // Insert materials
  const insertedMaterials = await db.insert(materials).values(materialsSeed).returning();
  console.log('Seeded materials:', insertedMaterials);



  console.log('Seeding finished successfully!');
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  Deno.exit(1);
}).finally(() => {
  client.end();
});
