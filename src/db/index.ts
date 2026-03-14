import { Pool } from "pg";
import { env } from "../config/env";

console.log("DATABASE URL:", env.databaseUrl);

export const pool = new Pool({
  connectionString: env.databaseUrl
});

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("SELECT current_database()");
  } finally {
    client.release();
  }
}
