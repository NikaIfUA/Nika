import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema.ts';
import postgres from 'postgres';

let cached: { db?: PostgresJsDatabase<typeof schema> } = {};

export function getDbInstance(connectionString?: string) {
  if (cached.db) return cached.db;

  if (!connectionString) {
    connectionString = Deno.env.get('DB_URL') || '';
  }

  if (!connectionString) {
    throw new Error('DB_URL is not set');
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });
  cached.db = db;
  return db;
}

export type Db = PostgresJsDatabase<typeof schema>;
