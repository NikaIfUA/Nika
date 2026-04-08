import type { IItem } from '@/interfaces';

export interface FilterOptions {
  selectedCategories: string[];
  selectedMaterials: string[];
  priceRange: [number, number];
  sortBy: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export function getPriceRange(items: IItem[]): PriceRange {
  const prices = items.map(item => item.price || 0).filter(p => p > 0);
  return {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 1000,
  };
}

export function filterItems(items: IItem[], filters: FilterOptions): IItem[] {
  return items.filter(item => {
    if (filters.selectedCategories.length > 0) {
      const hasCategory = item.categories?.some(cat => 
        filters.selectedCategories.includes(cat.id)
      );
      if (!hasCategory) return false;
    }

    if (filters.selectedMaterials.length > 0) {
      const hasMaterial = item.materials?.some(mat => 
        filters.selectedMaterials.includes(mat.id)
      );
      if (!hasMaterial) return false;
    }

    const price = item.price || 0;
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }

    return true;
  });
}

export function sortItems(items: IItem[], sortBy: string): IItem[] {
  const itemsCopy = [...items];

  switch (sortBy) {
    case 'title-asc':
      return itemsCopy.sort((a, b) => 
        (a.title || '').localeCompare(b.title || '', 'uk')
      );
    case 'title-desc':
      return itemsCopy.sort((a, b) => 
        (b.title || '').localeCompare(a.title || '', 'uk')
      );
    case 'price-asc':
      return itemsCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-desc':
      return itemsCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
    default:
      return itemsCopy;
  }
}

export function getAvailableCategories(items: IItem[]): Array<{ title: string; value: string }> {
  const categories = new Map<string, string>();
  items.forEach(item => {
    item.categories?.forEach(cat => {
      if (cat.id && cat.name) categories.set(cat.id, cat.name);
    });
  });
  return Array.from(categories.entries()).map(([id, name]) => ({
    title: name,
    value: id,
  }));
}

export function getAvailableMaterials(items: IItem[]): Array<{ title: string; value: string }> {
  const materials = new Map<string, string>();
  items.forEach(item => {
    item.materials?.forEach(mat => {
      if (mat.id && mat.name) materials.set(mat.id, mat.name);
    });
  });
  return Array.from(materials.entries()).map(([id, name]) => ({
    title: name,
    value: id,
  }));
}

export function hasActiveFilters(
  filters: FilterOptions,
  priceRange: PriceRange
): boolean {
  return (
    filters.selectedCategories.length > 0 ||
    filters.selectedMaterials.length > 0 ||
    filters.priceRange[0] !== priceRange.min ||
    filters.priceRange[1] !== priceRange.max
  );
}
