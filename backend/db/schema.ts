import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

// Use varchar(26) for ULID-compatible ids (ULID string length is 26 characters)
export const images = table('images', {
  id: t.varchar('id', { length: 26 }).primaryKey(),
  url: t.varchar('url', { length: 512 }).notNull(),
  title: t.varchar('title', { length: 255 }),
  description: t.text('description'),
  category_id: t.varchar('category_id', { length: 26 }), 
  price: t.integer('price'), 
  amount_available: t.integer('amount_available'), 
  materials: t.json('materials'), 
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const categories = table('categories', {
  id: t.varchar('id', { length: 26 }).primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const materials = table('materials', {
  id: t.varchar('id', { length: 26 }).primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  created_at: t.timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: t.timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
