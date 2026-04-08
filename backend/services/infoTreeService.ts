import { getMaterials, getMaterialsByParentId } from "../db/crud/materialCrud.ts";
import { getTechnologies, getTechnologiesByParentId } from "../db/crud/technologyCrud.ts";
import RedisCacheService from "./redisCacheService.ts";

export type FlatMaterial = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
};

export type FlatTechnology = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
};

export type InfoTreePayload = {
  materials: FlatMaterial[];
  technologies: FlatTechnology[];
  cachedAt: string;
};

export type InfoTreeChildNode = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  hasChildren: boolean;
};

export type InfoTreeChildrenPayload = {
  items: InfoTreeChildNode[];
  cachedAt: string;
};

const INFO_TREE_CACHE_KEY = "info:treeview:v1";
const INFO_TREE_CACHE_TTL_SECONDS = 60 * 30;

class InfoTreeService {
  public static async getInfoTree(): Promise<InfoTreePayload> {
    const cached = await RedisCacheService.getJson<InfoTreePayload>(INFO_TREE_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const [materialsRaw, technologiesRaw] = await Promise.all([
      getMaterials(),
      getTechnologies(),
    ]);

    const payload: InfoTreePayload = {
      materials: materialsRaw.map((item: any) => ({
        id: String(item.id),
        name: String(item.name),
        slug: String(item.slug),
        description: item.description ?? null,
        parentId: item.parentId ? String(item.parentId) : null,
      })),
      technologies: technologiesRaw.map((item: any) => ({
        id: String(item.id),
        name: String(item.name),
        slug: String(item.slug),
        description: item.description ?? null,
        parentId: item.parentId ? String(item.parentId) : null,
      })),
      cachedAt: new Date().toISOString(),
    };

    await RedisCacheService.setJson(INFO_TREE_CACHE_KEY, payload, INFO_TREE_CACHE_TTL_SECONDS);
    return payload;
  }

  public static async invalidateInfoTreeCache(): Promise<void> {
    await RedisCacheService.del(INFO_TREE_CACHE_KEY);
  }

  public static async getInfoTreeChildren(
    type: "material" | "technology",
    parentId: string | null,
  ): Promise<InfoTreeChildrenPayload> {
    const cacheKey = `info:children:${type}:${parentId ?? "root"}`;

    const cached = await RedisCacheService.getJson<InfoTreeChildrenPayload>(cacheKey);
    if (cached) {
      return cached;
    }

    const rows = type === "material"
      ? await getMaterialsByParentId(parentId)
      : await getTechnologiesByParentId(parentId);

    const payload: InfoTreeChildrenPayload = {
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        parentId: r.parentId,
        hasChildren: r.hasChildren,
      })),
      cachedAt: new Date().toISOString(),
    };

    await RedisCacheService.setJson(cacheKey, payload, INFO_TREE_CACHE_TTL_SECONDS);
    return payload;
  }

  public static async invalidateInfoTreeChildrenCache(
    type: "material" | "technology",
    parentId: string | null,
  ): Promise<void> {
    await RedisCacheService.del(`info:children:${type}:${parentId ?? "root"}`);
  }
}

export default InfoTreeService;
