import "dotenv/config";
import { Pool } from "pg";

let pool;

function buildConfig() {
  const config = {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
  };

  if (process.env.PG_SSL === "true") {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

export function getDb() {
  if (!pool) {
    pool = new Pool(buildConfig());
  }

  return pool;
}

export async function query(text, params = []) {
  const db = getDb();
  return db.query(text, params);
}

export async function withTransaction(callback) {
  const db = getDb();
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
