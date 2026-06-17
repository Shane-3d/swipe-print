import mysql from "mysql2/promise";

/**
 * MySQL access via mysql2 (pure JS — no native build). Designed for Laravel
 * Herd's bundled MySQL but works with any MySQL 8 instance. The schema is
 * auto-created on first use so local testing needs zero manual migration.
 */

const cfg = {
  host: process.env.DATABASE_HOST || "127.0.0.1",
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "swipe_print",
};

let pool: mysql.Pool | null = null;
let ready: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  // Connect without a database first so we can create it if missing.
  const root = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    multipleStatements: true,
  });
  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await root.end();

  pool = mysql.createPool({ ...cfg, waitForConnections: true, connectionLimit: 10 });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            VARCHAR(40)  PRIMARY KEY,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      display_name  VARCHAR(120) NOT NULL DEFAULT 'Maker',
      share_id      VARCHAR(40)  NULL UNIQUE,
      created_at    BIGINT       NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    VARCHAR(40)  NOT NULL,
      model_id   VARCHAR(191) NOT NULL,
      data       JSON         NOT NULL,
      created_at BIGINT       NOT NULL,
      UNIQUE KEY uniq_user_model (user_id, model_id),
      KEY idx_user (user_id),
      CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);
}

export async function getPool(): Promise<mysql.Pool> {
  if (!ready) {
    ready = ensureSchema().catch((e) => {
      // Reset so a later request can retry (e.g. DB started after the app).
      ready = null;
      throw e;
    });
  }
  await ready;
  return pool!;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = await getPool();
  const [rows] = await p.query(sql, params);
  return rows as T[];
}
