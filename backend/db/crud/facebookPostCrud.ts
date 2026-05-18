import { eq } from 'npm:drizzle-orm';
import { asc } from 'npm:drizzle-orm';
import { getDbInstance } from '../connection.ts';
import { facebook_posts } from '../schema.ts';

export async function createFacebookPost(data: { id: string; title?: string; embed_html: string; position?: number }) {
  const db = getDbInstance();
  const result = await db.insert(facebook_posts).values(data).returning().then((res) => res[0]);
  return result;
}

export async function getFacebookPosts() {
  const db = getDbInstance();
  return await db.select().from(facebook_posts).orderBy(asc(facebook_posts.position));
}

export async function updateFacebookPost(id: string, data: { title?: string; embed_html?: string; position?: number }) {
  const db = getDbInstance();
  await db.update(facebook_posts).set({ ...data, updated_at: new Date() }).where(eq(facebook_posts.id, id));
  return await db.select().from(facebook_posts).where(eq(facebook_posts.id, id)).then(res => res[0]);
}

export async function deleteFacebookPost(id: string) {
  const db = getDbInstance();
  return await db.delete(facebook_posts).where(eq(facebook_posts.id, id));
}
