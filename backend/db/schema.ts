import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const categories = table('categories', {
  id: t.varchar('id', { length: 50 }).primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const images = table('images', {
  id: t.varchar('id', { length: 50 }).primaryKey(),
  url: t.varchar('url', { length: 512 }).notNull(),
  title: t.varchar('title', { length: 255 }).notNull(),
  description: t.text('description'),
  category_id: t.varchar('category_id', { length: 50 }).references(() => categories.id, { onDelete: 'set null' }), // If a category is deleted, set this to null.
  price: t.integer('price'),
  amount_available: t.integer('amount_available'),
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
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
