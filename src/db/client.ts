import { Pool, QueryResult } from 'pg';
import { config } from '../config/env';

const pool = new Pool({ connectionString: config.databaseUrl });

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(1);
});

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function getClient() {
  return pool.connect();
}
