import { getDbInstance } from '../connection.ts';
import { items, images, categories, materials, technologies, imageMaterials, categoryItems, itemTechnologies } from '../schema.ts';
import * as schema from '../schema.ts';
import { eq, inArray, and } from 'npm:drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { IItem, ICategory, IMaterial, ITechnology, IImage } from '../../Interfaces.ts';

export default class Database {
  private db: NodePgDatabase<typeof schema>;

  constructor() {
    this.db = getDbInstance();
  }

  public async getItems(): Promise<IItem[]> {
    const itemRows = await this.db.select().from(items);
    if (!itemRows.length) {
      return [];
    }
    return await this.mapRowsToItems(itemRows);
  }

  public async getItemById(id: string): Promise<IItem | undefined> {
    const itemRows = await this.db.select().from(items).where(eq(items.id, id)).limit(1);
    if (!itemRows.length) {
      return undefined;
    }
    const result = await this.mapRowsToItems(itemRows);
    return result[0];
  }

  public async createItem(itemData: IItem): Promise<IItem | undefined> {
    const newItemId = itemData.id;

    await this.db.transaction(async (tx) => {
      await tx.insert(items).values({
        id: newItemId,
        title: itemData.title,
        description: itemData.description,
        price: itemData.price,
        amount_available: itemData.amountAvailable,
        isUnique: itemData.isUnique,
      });

      const newCategories = itemData.categories;
      if (newCategories && newCategories.length > 0) {
        const categoryLinks = newCategories.map(cat => ({
          id: globalThis.crypto.randomUUID(),
          item_id: newItemId,
          category_id: cat.id,
          selected_sections: cat.selectedSections || null,
        }));
        await tx.insert(categoryItems).values(categoryLinks);
      }

      const newTechnologies = itemData.technologies;
      if (newTechnologies && newTechnologies.length > 0) {
        const technologyLinks = newTechnologies.map(tech => ({
          id: globalThis.crypto.randomUUID(),
          item_id: newItemId,
          technology_id: tech.id,
          selected_sections: tech.selectedSections || null,
        }));
        await tx.insert(itemTechnologies).values(technologyLinks);
      }

      const newImages = itemData.images;
      if (newImages && newImages.length > 0) {
        const imageValues = newImages.map(img => ({
          id: img.id,
          url: img.url,
          description: img.description,
          resolution_width: img.resolution.width,
          resolution_height: img.resolution.height,
          mime_type: img.mimeType,
          weight: img.weight,
          item_id: newItemId,
        }));
        await tx.insert(images).values(imageValues);

        const coverImageId = newImages[0].id;
        await tx.update(items)
          .set({ cover_image_id: coverImageId })
          .where(eq(items.id, newItemId));

        const materialIds = itemData.materials?.map(mat => mat.id) ?? [];
        if (materialIds.length > 0) {
          const materialSectionsById = new Map(itemData.materials?.map(mat => [mat.id, mat.selectedSections]) ?? []);
          const imageMaterialValues: { id: string; image_id: string; material_id: string; selected_sections?: number[] | null }[] = [];
          for (const image of newImages) {
            for (const materialId of materialIds) {
              imageMaterialValues.push({
                id: globalThis.crypto.randomUUID(),
                image_id: image.id,
                material_id: materialId,
                selected_sections: materialSectionsById.get(materialId) || null,
              });
            }
          }
          if (imageMaterialValues.length > 0) {
            await tx.insert(imageMaterials).values(imageMaterialValues);
          }
        }
      }
    });

    return this.getItemById(newItemId);
  }

  private async mapRowsToItems(itemRows: (typeof items.$inferSelect)[]): Promise<IItem[]> {
    const itemIds = itemRows.map(it => it.id);
    if (!itemIds.length) return [];

    const allImagesForItems = await this.db.select().from(images).where(inArray(images.item_id, itemIds));
    const imagesByItemId = new Map<string, (typeof images.$inferSelect)[]>();
    for (const image of allImagesForItems) {
      if (!image.item_id) continue;
      const existing = imagesByItemId.get(image.item_id) ?? [];
      existing.push(image);
      imagesByItemId.set(image.item_id, existing);
    }

    const categoryRelations = await this.db.select()
      .from(categoryItems)
      .where(inArray(categoryItems.item_id, itemIds));
    const allCategoryIds = [...new Set(categoryRelations.map(rel => rel.category_id))];
    const allCategories = allCategoryIds.length > 0
      ? await this.db.select().from(categories).where(inArray(categories.id, allCategoryIds))
      : [];
    const categoriesMap = new Map(allCategories.map(cat => [cat.id, cat]));

    const categoriesByItemId = new Map<string, ICategory[]>();
    for (const relation of categoryRelations) {
      const categoryData = categoriesMap.get(relation.category_id);
      if (categoryData) {
        const existing = categoriesByItemId.get(relation.item_id) ?? [];
        existing.push({
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description ?? undefined,
          selectedSections: relation.selected_sections as number[] | undefined,
        });
        categoriesByItemId.set(relation.item_id, existing);
      }
    }

    const technologyRelations = await this.db.select()
      .from(itemTechnologies)
      .where(inArray(itemTechnologies.item_id, itemIds));
    const allTechnologyIds = [...new Set(technologyRelations.map(rel => rel.technology_id))];
    const allTechnologies = allTechnologyIds.length > 0
      ? await this.db.select().from(technologies).where(inArray(technologies.id, allTechnologyIds))
      : [];
    const technologiesMap = new Map(allTechnologies.map(tech => [tech.id, tech]));

    const technologiesByItemId = new Map<string, ITechnology[]>();
    for (const relation of technologyRelations) {
      const technologyData = technologiesMap.get(relation.technology_id);
      if (technologyData) {
        const existing = technologiesByItemId.get(relation.item_id) ?? [];
        existing.push({ 
          id: technologyData.id, 
          name: technologyData.name, 
          slug: technologyData.slug,
          description: technologyData.description ?? undefined,
          selectedSections: relation.selected_sections as number[] | undefined
        });
        technologiesByItemId.set(relation.item_id, existing);
      }
    }

    const allImageIds = allImagesForItems.map(img => img.id);
    const imageIdToItemId = new Map(allImagesForItems.map(img => [img.id, img.item_id ?? '']));
    const imageMaterialRelations = allImageIds.length > 0
      ? await this.db.select().from(imageMaterials).where(inArray(imageMaterials.image_id, allImageIds))
      : [];
    const materialIds = imageMaterialRelations.map(rel => rel.material_id);
    const allMaterials = materialIds.length > 0
      ? await this.db.select().from(materials).where(inArray(materials.id, materialIds))
      : [];
    const materialsMap = new Map(allMaterials.map(mat => [mat.id, mat]));

    const materialSectionsByItemId = new Map<string, Map<string, number[]>>();
    for (const relation of imageMaterialRelations) {
      const itemId = imageIdToItemId.get(relation.image_id);
      if (!itemId) continue;
      const selected = relation.selected_sections as number[] | undefined;
      if (!selected || selected.length === 0) continue;
      const itemMap = materialSectionsByItemId.get(itemId) ?? new Map<string, number[]>();
      if (!itemMap.has(relation.material_id)) {
        itemMap.set(relation.material_id, selected);
        materialSectionsByItemId.set(itemId, itemMap);
      }
    }

    const materialsByImageId = new Map<string, (typeof materials.$inferSelect)[]>();
    for (const relation of imageMaterialRelations) {
      const material = materialsMap.get(relation.material_id);
      if (material) {
        const existing = materialsByImageId.get(relation.image_id) ?? [];
        existing.push(material);
        materialsByImageId.set(relation.image_id, existing);
      }
    }

    return itemRows.map(row => {
      const itemImageRecords = imagesByItemId.get(row.id) || [];
      const allMaterialsForItem = new Map<string, IMaterial>();

      const itemImages: IImage[] = itemImageRecords.map(imgRecord => {
        (materialsByImageId.get(imgRecord.id) || []).forEach(mat => {
          const selections = materialSectionsByItemId.get(row.id)?.get(mat.id);
          allMaterialsForItem.set(mat.id, {
            id: mat.id,
            name: mat.name,
            slug: mat.slug,
            description: mat.description ?? undefined,
            selectedSections: selections,
          });
        });

        return {
          id: imgRecord.id,
          url: imgRecord.url,
          description: imgRecord.description ?? undefined,
          resolution: { width: imgRecord.resolution_width ?? 0, height: imgRecord.resolution_height ?? 0 },
          mimeType: imgRecord.mime_type,
          weight: imgRecord.weight
        };
      });

      const itemCategories: ICategory[] = categoriesByItemId.get(row.id) || [];
      const itemTechnologies: ITechnology[] = technologiesByItemId.get(row.id) || [];

      const item: IItem = {
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        amountAvailable: row.amount_available,
        coverImage: row.cover_image_id ?? '',
        images: itemImages,
        categories: itemCategories,
        materials: Array.from(allMaterialsForItem.values()),
        technologies: itemTechnologies,
        isUnique: row.isUnique,
      };

      return item;
    });
  }

  public async updateItem(id: string, itemData: IItem): Promise<IItem | undefined> {
    await this.db.transaction(async (tx) => {
      await tx.update(items).set({
        title: itemData.title,
        description: itemData.description,
        price: itemData.price,
        amount_available: itemData.amountAvailable,
        isUnique: itemData.isUnique,
        updated_at: new Date(),
      }).where(eq(items.id, id));

      await tx.delete(categoryItems).where(eq(categoryItems.item_id, id));

      const newCategories = itemData.categories;
      if (newCategories && newCategories.length > 0) {
        const categoryLinks = newCategories.map(cat => ({
          id: globalThis.crypto.randomUUID(),
          item_id: id,
          category_id: cat.id,
          selected_sections: cat.selectedSections || null,
        }));
        await tx.insert(categoryItems).values(categoryLinks);
      }

      await tx.delete(itemTechnologies).where(eq(itemTechnologies.item_id, id));

      const newTechnologies = itemData.technologies;
      if (newTechnologies && newTechnologies.length > 0) {
        const technologyLinks = newTechnologies.map(tech => ({
          id: globalThis.crypto.randomUUID(),
          item_id: id,
          technology_id: tech.id,
          selected_sections: tech.selectedSections || null,
        }));
        await tx.insert(itemTechnologies).values(technologyLinks);
      }
      
      const existingImages = await tx.select({ id: images.id }).from(images).where(eq(images.item_id, id));
      const existingImageIds = existingImages.map(img => img.id);
      const newImageIds = itemData.images.map(img => img.id);

      const imagesToDelete = existingImageIds.filter(imgId => !newImageIds.includes(imgId));
      const imagesToAdd = itemData.images.filter(img => !existingImageIds.includes(img.id));

      if (imagesToDelete.length > 0) {
        await tx.delete(images).where(and(eq(images.item_id, id), inArray(images.id, imagesToDelete)));
      }

      if (imagesToAdd.length > 0) {
        const imageValues = imagesToAdd.map(img => ({
          id: img.id,
          url: img.url,
          description: img.description,
          resolution_width: img.resolution.width,
          resolution_height: img.resolution.height,
          mime_type: img.mimeType,
          weight: img.weight,
          item_id: id,
        }));
        await tx.insert(images).values(imageValues);
      }

      const allCurrentImageIds = newImageIds;
      if (allCurrentImageIds.length > 0) {
        await tx.delete(imageMaterials).where(inArray(imageMaterials.image_id, allCurrentImageIds));

        const materialIds = itemData.materials?.map(mat => mat.id) ?? [];
        if (materialIds.length > 0) {
          const materialSectionsById = new Map(itemData.materials?.map(mat => [mat.id, mat.selectedSections]) ?? []);
          const imageMaterialValues: { id: string; image_id: string; material_id: string; selected_sections?: number[] | null }[] = [];
          for (const imageId of allCurrentImageIds) {
            for (const materialId of materialIds) {
              imageMaterialValues.push({
                id: globalThis.crypto.randomUUID(),
                image_id: imageId,
                material_id: materialId,
                selected_sections: materialSectionsById.get(materialId) || null,
              });
            }
          }
          if (imageMaterialValues.length > 0) {
            await tx.insert(imageMaterials).values(imageMaterialValues);
          }
        }
      }

      const newCoverImage = itemData.images.length > 0 ? itemData.images[0].id : null;
      await tx.update(items).set({ cover_image_id: newCoverImage }).where(eq(items.id, id));
    });

    return this.getItemById(id);
  }

  public async deleteItem(id: string): Promise<boolean> {
    const result = await this.db.delete(items).where(eq(items.id, id));
    return result.rowCount > 0;
  }
}
