import { getDbInstance } from '../connection.ts';
import { materials, images } from '../schema.ts';
import { eq } from 'npm:drizzle-orm';

export async function createMaterial(data: { id: string; name: string; slug: string; description?: string; imageId?: string; parentId?: string | null }) {
  const db = getDbInstance();
  const materialData = {
    ...data,
    image_id: data.imageId,
    parent_id: data.parentId,
    parentId: undefined,
    imageId: undefined
  };
  const result = await db.insert(materials).values(materialData).returning().then((res) => res[0]);
  
  // Fetch with image relationship
  return await fetchMaterialWithImage(result.id);
}

export async function getMaterials() {
  const db = getDbInstance();
  const materialsList = await db.select().from(materials);
  
  // Fetch each material with its image
  return await Promise.all(materialsList.map(m => fetchMaterialWithImage(m.id)));
}

async function fetchMaterialWithImage(materialId: string) {
  const db = getDbInstance();
  const material = await db.select().from(materials).where(eq(materials.id, materialId)).then(res => res[0]);
  
  if (!material) return null;
  
  let image: any = null;
  if (material.image_id) {
    const imageRecord = await db.select().from(images).where(eq(images.id, material.image_id)).then(res => res[0]);
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
    ...material,
    parentId: material.parent_id ?? null,
    image: image
  };
}

export async function updateMaterial(id: string, data: { name?: string; description?: string; imageId?: string; parentId?: string | null }) {
  const db = getDbInstance();
  const updateData = {
    ...data,
    image_id: data.imageId,
    parent_id: data.parentId,
    parentId: undefined,
    imageId: undefined
  };
  await db.update(materials).set(updateData).where(eq(materials.id, id));
  
  // Fetch updated material with image
  return await fetchMaterialWithImage(id);
}

export async function deleteMaterial(id: string) {
  const db = getDbInstance();
  const deletedItems = await db.delete(materials).where(eq(materials.id, id));
  return deletedItems[0];
}
