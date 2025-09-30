import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import { categories, items, images, materials, imageMaterials } from './schema.ts';
import { IItem, ICategory, IMaterial } from '../Interfaces.ts';
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

  const imagesSeed: IItem[] = [
    {
      id: 'img_01',
      title: 'Enchanted Forest',
      category: categoriesSeed.find((c) => c.name === 'Nature') ?? null,
      price: 150,
      amountAvailable: 10,
      materials: [materialsSeed[0]],
      images: [
        {
          id: 'img_01',
          url: 'https://example.com/images/forest.jpg',
          description: 'Enchanted Forest',
          resolution: { width: 800, height: 600 },
          mimeType: 'image/jpeg',
          weight: null,
        },
      ],
      coverImage: 'img_01'
    },
    {
      id: 'img_02',
      title: 'Modern Architecture',
      category: categoriesSeed.find((c) => c.name === 'Architecture') ?? null,
      price: 200,
      amountAvailable: 5,
      materials: [materialsSeed[1]],
      images: [
        {
          id: 'img_02',
          url: 'https://example.com/images/architecture.jpg',
          description: 'Modern Architecture',
          resolution: { width: 1024, height: 768 },
          mimeType: 'image/jpeg',
          weight: null,
        },
      ],
      coverImage: 'img_02'
    },
    {
      id: 'img_03',
      title: 'Wild Animals',
      category: categoriesSeed.find((c) => c.name === 'Animals') ?? null,
      price: 300,
      amountAvailable: 8,
      materials: [materialsSeed[2]],
      images: [
        {
          id: 'img_03',
          url: 'https://example.com/images/animals.jpg',
          description: 'Wild Animals',
          resolution: { width: 1200, height: 800 },
          mimeType: 'image/jpeg',
          weight: null,
        },
      ],
      coverImage: 'img_03'
    },
  ];

  // Insert categories
  const insertedCategories = await db.insert(categories).values(categoriesSeed).returning();
  console.log('Seeded categories:', insertedCategories);

  // Insert materials
  const insertedMaterials = await db.insert(materials).values(materialsSeed).returning();
  console.log('Seeded materials:', insertedMaterials);

  // Insert items and image files
  const itemsToInsert = imagesSeed.map((it) => ({
    id: it.id,
    title: it.title,
    description: it.description ?? null,
    category_id: it.category?.id ?? null,
    price: it.price ?? null,
    amount_available: it.amountAvailable ?? null,
    cover_image_id: it.coverImage ?? null,
  }));

  const insertedItems = await db.insert(items).values(itemsToInsert).returning();
  console.log('Seeded items:', insertedItems);

  // Insert images and image_materials
  const imagesToInsert: any[] = [];
  const imageMaterialRows = [] as { id: string; image_id: string; material_id: string }[];

  for (const it of imagesSeed) {
    for (let i = 0; i < it.images.length; i++) {
      const img = it.images[i];
      const imgId = img.id ?? globalThis.crypto.randomUUID();
      imagesToInsert.push({
        id: imgId,
        item_id: it.id,
        url: img.url,
        description: img.description ?? null,
        resolution_width: img.resolution?.width ?? null,
        resolution_height: img.resolution?.height ?? null,
        mime_type: img.mimeType,
        weight: img.weight ?? null,
        position: i,
      });

      const mats = it.materials ?? [];
      for (const m of mats) {
        imageMaterialRows.push({ id: globalThis.crypto.randomUUID(), image_id: imgId, material_id: m.id });
      }
    }
  }

  const insertedImages = imagesToInsert.length ? await db.insert(images).values(imagesToInsert).returning() : [];
  console.log('Seeded images:', insertedImages);

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
