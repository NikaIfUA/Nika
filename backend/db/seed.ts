import { drizzle } from '../dependencies.ts';
import postgres from 'postgres';
import * as schema from './schema.ts';
import { categories, images, materials, imageMaterials } from './schema.ts';

console.log('Seeding started...');

const connectionString = Deno.env.get("DB_URL");
if (!connectionString) {
  throw new Error("DB_URL environment variable is not set!");
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log('Clearing existing data...');
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
    { id: globalThis.crypto.randomUUID(), name: 'Nature' },
    { id: globalThis.crypto.randomUUID(), name: 'Architecture' },
    { id: globalThis.crypto.randomUUID(), name: 'Animals' },
  ]).returning();

  console.log('Seeded categories:', insertedCategories);

  console.log('Seeding materials...');
  const insertedMaterials = await db.insert(materials).values([
    {
      id: globalThis.crypto.randomUUID(),
      name: 'Cotton',
    },
    {
      id: globalThis.crypto.randomUUID(),
      name: 'Wood',
    },
    {
      id: globalThis.crypto.randomUUID(),
      name: 'Metal',
    },
  ]).returning();
  console.log('Seeded materials:', insertedMaterials);

  console.log('Seeding images...');
  const imageSeedData = [
    {
      id: globalThis.crypto.randomUUID(),
      image_data: new TextEncoder().encode('seed-image-1'), // placeholder
      mime_type: 'image/jpeg',
      title: 'Enchanted Forest',
      description: 'A mystical forest shimmering with morning dew.',
      category_id: insertedCategories.find(c => c.name === 'Nature')?.id!,
      price: '149.99',
      amount_available: 10,
    },
    {
      id: globalThis.crypto.randomUUID(),
      image_data: new TextEncoder().encode('seed-image-2'),
      mime_type: 'image/png',
      title: 'Metropolis Skyline',
      description: 'The sharp lines of a futuristic city at dusk.',
      category_id: insertedCategories.find(c => c.name === 'Architecture')?.id!,
      price: '210.50',
      amount_available: 5,
    },
    {
      id: globalThis.crypto.randomUUID(),
      image_data: new TextEncoder().encode('seed-image-3'),
      mime_type: 'image/jpeg',
      title: 'Majestic Lion',
      description: 'A portrait of a lion, king of the savannah.',
      category_id: insertedCategories.find(c => c.name === 'Animals')?.id!,
      price: '180.00',
      amount_available: 8,
    },
  ];

  const seededImages = await db.insert(schema.images).values(imageSeedData).returning();
  console.log('Seeded images:', seededImages);

  console.log('Seeding image-material relations...');
  const imageMaterialData = [
    {
      id: globalThis.crypto.randomUUID(),
      image_id: seededImages[0].id,
      material_id: insertedMaterials[0].id,
    },
    {
      id: globalThis.crypto.randomUUID(),
      image_id: seededImages[0].id,
      material_id: insertedMaterials[1].id,
    },
    {
      id: globalThis.crypto.randomUUID(),
      image_id: seededImages[2].id,
      material_id: insertedMaterials[2].id,
    },
  ];

  console.log('Image-Material relations to insert:', imageMaterialData);

  await db.insert(schema.imageMaterials).values(imageMaterialData).returning();
  console.log('✅ Seeded image-material relations:', imageMaterialData);

  console.log('Seeding finished successfully!');
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  Deno.exit(1);
}).finally(() => {
  client.end();
});
