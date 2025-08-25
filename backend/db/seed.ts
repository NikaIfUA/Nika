import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import { categories, images, materials, imageMaterials } from './schema.ts';
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
    { name: 'image_materials', action: () => db.delete(imageMaterials) },
    { name: 'images', action: () => db.delete(images) },
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
  const insertedCategories = await db.insert(categories).values([
    { id: 'cat_01', name: 'Nature' },
    { id: 'cat_02', name: 'Architecture' },
    { id: 'cat_03', name: 'Animals' },
  ]).returning();

  console.log('Seeded categories:', insertedCategories);

  console.log('Seeding images...');
  const insertedImages = await db.insert(images).values([
    {
      id: 'img_01',
      url: 'https://example.com/images/forest.jpg',
      title: 'Enchanted Forest',
      category_id: insertedCategories.find(c => c.name === 'Nature')?.id, // Find the correct ID
      price: 150,
      amount_available: 10,
    },
    {
      id: 'img_02',
      url: 'https://example.com/images/architecture.jpg',
      title: 'Modern Architecture',
      category_id: insertedCategories.find(c => c.name === 'Architecture')?.id,
      price: 200,
      amount_available: 5,
    },
    {
      id: 'img_03',
      url: 'https://example.com/images/animals.jpg',
      title: 'Wild Animals',
      category_id: insertedCategories.find(c => c.name === 'Animals')?.id,
      price: 300,
      amount_available: 8,
    },
  ]).returning();

  console.log('Seeded images:', insertedImages);

  console.log('Seeding materials...');
  const insertedMaterials = await db.insert(materials).values([
    {
      id: 'mat_01',
      name: 'Cotton',
    },
    {
      id: 'mat_02',
      name: 'Wood',
    },
    {
      id: 'mat_03',
      name: 'Metal',
    },
  ]).returning();

  const insertedImageMaterials = await db.insert(imageMaterials).values([
    {
      id: 'img_mat_01',
      image_id: insertedImages[0].id,
      material_id: insertedMaterials[0].id,
    },
    {
      id: 'img_mat_02',
      image_id: insertedImages[1].id,
      material_id: insertedMaterials[1].id,
    },
    {
      id: 'img_mat_03',
      image_id: insertedImages[2].id,
      material_id: insertedMaterials[2].id,
    },
  ]).returning();

  console.log('Seeded materials:', insertedMaterials);

  console.log('Seeded image materials:', insertedImageMaterials);

  console.log('Seeding finished successfully!');
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  Deno.exit(1);
}).finally(() => {
  client.end();
});
