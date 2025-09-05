import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import { categories, images, materials, imageMaterials } from './schema.ts';
import { IImage, ICategory, IMaterial } from '../Interfaces.ts';
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

  const imagesSeed: IImage[] = [
    {
      id: 'img_01',
      url: 'https://example.com/images/forest.jpg',
      title: 'Enchanted Forest',
      category: categoriesSeed.find((c) => c.name === 'Nature') ?? null,
      price: 150,
      amountAvailable: 10,
      materials: [materialsSeed[0]],
    },
    {
      id: 'img_02',
      url: 'https://example.com/images/architecture.jpg',
      title: 'Modern Architecture',
      category: categoriesSeed.find((c) => c.name === 'Architecture') ?? null,
      price: 200,
      amountAvailable: 5,
      materials: [materialsSeed[1]],
    },
    {
      id: 'img_03',
      url: 'https://example.com/images/animals.jpg',
      title: 'Wild Animals',
      category: categoriesSeed.find((c) => c.name === 'Animals') ?? null,
      price: 300,
      amountAvailable: 8,
      materials: [materialsSeed[2]],
    },
  ];

  // Insert categories
  const insertedCategories = await db.insert(categories).values(categoriesSeed).returning();
  console.log('Seeded categories:', insertedCategories);

  // Insert materials
  const insertedMaterials = await db.insert(materials).values(materialsSeed).returning();
  console.log('Seeded materials:', insertedMaterials);

  // Map images to DB shape
  const imagesToInsert = imagesSeed.map((img) => ({
    id: img.id,
    url: img.url,
    title: img.title,
    description: img.description ?? null,
    category_id: img.category?.id ?? null,
    price: img.price ?? null,
    amount_available: img.amountAvailable ?? null,
  }));

  const insertedImages = await db.insert(images).values(imagesToInsert).returning();
  console.log('Seeded images:', insertedImages);

  // Insert image_materials based on imagesSeed materials
  const imageMaterialRows = [] as { id: string; image_id: string; material_id: string }[];
  for (const img of imagesSeed) {
    const mats = img.materials ?? [];
    for (const m of mats) {
      imageMaterialRows.push({ id: globalThis.crypto.randomUUID(), image_id: img.id, material_id: m.id });
    }
  }

  const insertedImageMaterials = imageMaterialRows.length ? await db.insert(imageMaterials).values(imageMaterialRows).returning() : [];
  console.log('Seeded image materials:', insertedImageMaterials);

  console.log('Seeding finished successfully!');
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  Deno.exit(1);
}).finally(() => {
  client.end();
});
