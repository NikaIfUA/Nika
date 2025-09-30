import { pgTable as table } from "npm:drizzle-orm/pg-core";
import * as t from "npm:drizzle-orm/pg-core";

export const categories = table('categories', {
  id: t.varchar('id', { length: 50 }).primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Items table reflects higher-level product/item metadata (IItem)
export const items = table('items', {
  id: t.varchar('id', { length: 50 }).primaryKey(),
  title: t.varchar('title', { length: 255 }).notNull(),
  description: t.text('description'),
  category_id: t.varchar('category_id', { length: 50 }).references(() => categories.id, { onDelete: 'set null' }),
  price: t.integer('price'),
  amount_available: t.integer('amount_available'),
  cover_image_id: t.varchar('cover_image_id', { length: 50 }), // nullable by default
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Images table stores file-level metadata and links to items (one item -> many images)
export const images = table('images', {
  id: t.varchar('id', { length: 50 }).primaryKey(),
  item_id: t.varchar('item_id', { length: 50 }).references(() => items.id, { onDelete: 'cascade' }),
  url: t.varchar('url', { length: 1024 }).notNull(),
  description: t.text('description'),
  resolution_width: t.integer('resolution_width'),
  resolution_height: t.integer('resolution_height'),
  mime_type: t.varchar('mime_type', { length: 255 }).notNull(),
  weight: t.integer('weight'),
  position: t.integer('position').default(0),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const imageMaterials = table('image_materials', {
  id: t.varchar('id', { length: 50 }).primaryKey(),
  image_id: t.varchar('image_id', { length: 50 }).notNull().references(() => images.id, { onDelete: 'cascade' }),
  material_id: t.varchar('material_id', { length: 50 }).notNull().references(() => materials.id, { onDelete: 'cascade' }),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const materials = table('materials', {
  id: t.varchar('id', { length: 50 }).primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = table('users', {
  id: t.varchar('id', { length: 50 }).primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  email: t.varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: t.varchar('password_hash', { length: 255 }).notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const blacklisted_tokens = table('blacklisted_tokens', {
  id: t.varchar('id', { length: 50 }).primaryKey(),
  token: t.text('token').notNull(),
  user_id: t.varchar('user_id', { length: 50 }).references(() => users.id, { onDelete: 'cascade' }),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
