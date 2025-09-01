import { table, customType } from "../dependencies.ts";
import * as t from "drizzle-orm/pg-core";

// Create a custom type BYTEA for storing images directly in PSQL
const byteaType = customType<{ data: Uint8Array }>({
  dataType() {
    return 'bytea';
  },
});

export const categories = table('categories', {
  id: t.uuid('id').primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const images = table('images', {
  id: t.uuid('id').primaryKey(),
  image_data: byteaType('image_data').notNull(),
  mime_type: t.varchar('mime_type', { length: 50 }).notNull(),
  title: t.varchar('title', { length: 255 }).notNull(),
  description: t.text('description'),
  category_id: t.uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  price: t.numeric('price', { precision: 10, scale: 2 }),
  amount_available: t.integer('amount_available'),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const imageMaterials = table('image_materials', {
  id: t.uuid('id').primaryKey(),
  image_id: t.uuid('image_id').notNull().references(() => images.id, { onDelete: 'cascade' }),
  material_id: t.uuid('material_id').notNull().references(() => materials.id, { onDelete: 'cascade' }),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const materials = table('materials', {
  id: t.uuid('id').primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
