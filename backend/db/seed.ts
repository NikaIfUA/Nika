import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import { categories, images, materials } from './schema.ts';
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
  await db.delete(images);
  await db.delete(categories);
  await db.delete(materials);

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
      imageId: 'img_01',
    },
    {
      id: 'mat_02',
      name: 'Wood',
      imageId: 'img_02',
    },
    {
      id: 'mat_03',
      name: 'Metal',
      imageId: 'img_03',
    },
  ]).returning();

  console.log('Seeded materials:', insertedMaterials);

  console.log('Seeding finished successfully!');
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  Deno.exit(1);
}).finally(() => {
  client.end();
});
