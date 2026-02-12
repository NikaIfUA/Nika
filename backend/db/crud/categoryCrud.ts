import { eq } from 'npm:drizzle-orm';
import { getDbInstance } from '../connection.ts';
import { categories, images } from '../schema.ts';

export async function createCategory(data: { id: string; name: string; slug: string; description?: string; imageId?: string }) {
  const db = getDbInstance();
  const categoryData = {
    ...data,
    image_id: data.imageId,
    imageId: undefined
  };
  const result = await db.insert(categories).values(categoryData).returning().then((res) => res[0]);
  return await fetchCategoryWithImage(result.id);
}

export async function getCategories() {
  const db = getDbInstance();
  const categoriesList = await db.select().from(categories);
  return await Promise.all(categoriesList.map(c => fetchCategoryWithImage(c.id)));
}

async function fetchCategoryWithImage(categoryId: string) {
  const db = getDbInstance();
  const category = await db.select().from(categories).where(eq(categories.id, categoryId)).then(res => res[0]);

  if (!category) return null;

  let image: any = null;
  if (category.image_id) {
    const imageRecord = await db.select().from(images).where(eq(images.id, category.image_id)).then(res => res[0]);
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
    ...category,
    image: image
  };
}

export async function updateCategory(id: string, data: { name?: string; description?: string; imageId?: string }) {
  const db = getDbInstance();
  const updateData = {
    ...data,
    image_id: data.imageId,
    imageId: undefined
  };
  await db.update(categories).set(updateData).where(eq(categories.id, id));
  return await fetchCategoryWithImage(id);
}

export async function deleteCategory(id: string) {
  const db = getDbInstance();
  const result = await db.delete(categories).where(eq(categories.id, id));
  return result;
}
