/**
 * Transliteration map for Ukrainian to Latin characters
 */
const ukrainianToLatinMap: Record<string, string> = {
  // Ukrainian lowercase letters
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
  'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
  'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ь': '', 'ю': 'yu', 'я': 'ya',
  
  // Ukrainian uppercase letters
  'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'h', 'Ґ': 'g', 'Д': 'd', 'Е': 'e', 'Є': 'ye',
  'Ж': 'zh', 'З': 'z', 'И': 'y', 'І': 'i', 'Ї': 'yi', 'Й': 'y', 'К': 'k', 'Л': 'l',
  'М': 'm', 'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
  'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'sch', 'Ь': '', 'Ю': 'yu', 'Я': 'ya',
};

/**
 * Generate a URL-friendly slug from a text string
 * Supports Ukrainian and Russian characters with transliteration
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text || !text.trim()) {
    return '';
  }

  let slug = text.trim();

  // Transliterate Ukrainian/Russian characters
  slug = slug
    .split('')
    .map(char => {
      // Check map first
      if (char in ukrainianToLatinMap) {
        return ukrainianToLatinMap[char];
      }
      // Spaces and underscores become hyphens
      if (/^[\s_]$/.test(char)) {
        return '-';
      }
      // If not in map and not ASCII alphanumeric, skip it
      if (/^[a-zA-Z0-9]$/.test(char)) {
        return char.toLowerCase();
      }
      return '';
    })
    .join('');

  // Replace spaces and underscores with hyphens
  slug = slug.replace(/[\s_]+/g, '-');

  // Replace multiple consecutive hyphens with a single hyphen
  slug = slug.replace(/-+/g, '-');

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Generate a unique suffix for slug (4 random characters)
 * @returns A unique suffix
 */
export function generateSlugSuffix(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return suffix;
}

/**
 * Create a slug with automatic retry on duplicate
 * Handles duplicate slug errors by adding suffixes until unique or max retries reached
 * @param baseSlug - The base slug to use
 * @param createFunction - Function that creates the item (should throw error if slug exists)
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 * @returns The created item or throws error if all retries failed
 */
export async function createWithUniqueSlug<T>(
  baseSlug: string,
  createFunction: (slug: string) => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  let finalSlug = baseSlug;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await createFunction(finalSlug);
    } catch (err) {
      const errorMsg = String(err);
      if (errorMsg.includes('duplicate') && errorMsg.includes('slug')) {
        finalSlug = `${baseSlug}-${generateSlugSuffix()}`;
        retries++;
      } else {
        throw err;
      }
    }
  }

  throw new Error(`Unable to create unique slug for "${baseSlug}" after ${maxRetries} attempts`);
}
