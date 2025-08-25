import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as dbSchema from './schema.ts';
import postgres from 'postgres';

const cached: { db?: PostgresJsDatabase<typeof dbSchema> } = {};

export function getDbInstance(connectionString?: string) {
  if (cached.db) return cached.db;
  else if (!connectionString) {
    connectionString = Deno.env.get('DB_URL') || '';
  }

  if (!connectionString) {
    throw new Error('DB_URL is not set');
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema: dbSchema });
  cached.db = db;
  return db;
}

export type Db = PostgresJsDatabase<typeof dbSchema>;
