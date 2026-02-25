import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const envLocalPath = path.join(rootDir, '.env.local');
const envPath = path.join(rootDir, '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required but was not provided');
}

export const config = {
  databaseUrl: DATABASE_URL,
};
