import { config } from './config/env';
import { getClient } from './db/client';

async function main() {
  console.log('Starting application startup checks...');
  // config import already validates DATABASE_URL
  try {
    const client = await getClient();
    try {
      const result = await client.query<{ now: string }>('SELECT NOW() as now');
      console.log(`Database connection successful. Current time: ${result.rows[0].now}`);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  console.log('Environment validated and database reachable.');
}

main().catch((err) => {
  console.error('Startup failed with unexpected error:', err);
  process.exit(1);
});
