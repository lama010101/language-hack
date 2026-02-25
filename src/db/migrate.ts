import fs from 'fs';
import path from 'path';
import { PoolClient } from 'pg';
import { getClient } from './client';

const migrationsDir = path.resolve(__dirname, '../../migrations');
const MIGRATION_LOCK_ID = 894561234; // arbitrary, consistent identifier for advisory lock

async function ensureMigrationsTable(client: PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

function loadMigrationFiles(): string[] {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.match(/^\d+_.+\.sql$/))
    .sort();
}

async function getAppliedMigrations(client: PoolClient): Promise<Set<string>> {
  const result = await client.query<{ filename: string }>('SELECT filename FROM schema_migrations');
  return new Set(result.rows.map((row: { filename: string }) => row.filename));
}

async function runMigration(client: PoolClient, filename: string) {
  const filePath = path.join(migrationsDir, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    await client.query('COMMIT');
    console.log(`✔ Migration applied: ${filename}`);
  } catch (err) {
    await client.query('ROLLBACK').catch((rollbackErr) => {
      console.error('Failed to rollback migration transaction:', rollbackErr);
    });
    console.error(`✖ Migration failed: ${filename}`, err);
    throw err;
  }
}

export async function runMigrations() {
  const client = await getClient();

  const releaseLock = async () => {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
    } catch (err) {
      console.error('Failed to release migration advisory lock:', err);
    }
  };

  try {
    const lockResult = await client.query<{ acquired: boolean }>(
      'SELECT pg_try_advisory_lock($1) as acquired',
      [MIGRATION_LOCK_ID]
    );

    if (!lockResult.rows[0]?.acquired) {
      throw new Error('Another migration process is currently running.');
    }

    await ensureMigrationsTable(client);

    const files = loadMigrationFiles();
    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }

    const applied = await getAppliedMigrations(client);
    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    for (const file of pending) {
      await runMigration(client, file);
    }

    console.log('All pending migrations applied.');
  } catch (err) {
    console.error('Migration runner encountered an error:', err);
    throw err;
  } finally {
    await releaseLock();
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .catch((err) => {
      console.error('Migration runner encountered an error:', err);
      process.exit(1);
    })
    .then(() => process.exit(0));
}
