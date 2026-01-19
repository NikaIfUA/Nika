import { getDbInstance } from '../connection.ts';
import { technologies, images } from '../schema.ts';
import { eq } from 'npm:drizzle-orm';

export async function createTechnology(data: { id: string; name: string; slug: string; description?: string; imageId?: string }) {
  const db = getDbInstance();
  const technologyData = {
    ...data,
    image_id: data.imageId,
    imageId: undefined
  };
  const result = await db.insert(technologies).values(technologyData).returning().then((res) => res[0]);
  
  // Fetch with image relationship
  return await fetchTechnologyWithImage(result.id);
}

export async function getTechnologies() {
  const db = getDbInstance();
  const technologiesList = await db.select().from(technologies);
  
  // Fetch each technology with its image
  return await Promise.all(technologiesList.map(t => fetchTechnologyWithImage(t.id)));
}

export async function getTechnologyBySlug(slug: string) {
  const db = getDbInstance();
  const technology = await db.select().from(technologies).where(eq(technologies.slug, slug)).then((res) => res[0]);
  
  if (!technology) return undefined;
  
  // Fetch with image
  return await fetchTechnologyWithImage(technology.id);
}

async function fetchTechnologyWithImage(technologyId: string) {
  const db = getDbInstance();
  const technology = await db.select().from(technologies).where(eq(technologies.id, technologyId)).then(res => res[0]);
  
  if (!technology) return null;
  
  let image: any = null;
  if (technology.image_id) {
    const imageRecord = await db.select().from(images).where(eq(images.id, technology.image_id)).then(res => res[0]);
    if (imageRecord) {
      image = {
        id: imageRecord.id,
        url: imageRecord.url,
        description: imageRecord.description,
        resolution: {
          width: imageRecord.resolution_width,
          height: imageRecord.resolution_height
        },
        mimeType: imageRecord.mime_type,
        weight: imageRecord.weight
      };
    }
  }
  
  return {
    ...technology,
    image: image
  };
}

export async function updateTechnology(id: string, data: { name?: string; description?: string; imageId?: string }) {
  const db = getDbInstance();
  const updateData = {
    ...data,
    image_id: data.imageId,
    imageId: undefined
  };
  await db.update(technologies).set(updateData).where(eq(technologies.id, id));
  
  // Fetch updated technology with image
  return await fetchTechnologyWithImage(id);
}

export async function deleteTechnology(id: string) {
  const db = getDbInstance();
  const deletedItems = await db.delete(technologies).where(eq(technologies.id, id));
  return deletedItems[0];
}
