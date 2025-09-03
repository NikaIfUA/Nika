import { pgTable as table, customType } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm/";

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

export type TImage = InferSelectModel<typeof images>;

/*

// src/db/schema.ts (continued)
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 256 }),
  email: varchar('email', { length: 256 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type for selecting data (all fields are non-optional)
export type User = InferSelectModel<typeof users>;

// Type for inserting data (fields with defaults or auto-increment are optional)
export type NewUser = InferInsertModel<typeof users>;
jtj-prvr-akg
*/
