import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from './db.js';

const here = dirname(fileURLToPath(import.meta.url));

function splitStatements(sql) {
  return sql
    .split(/;\s*$/m)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

const COLUMNS = [
  { table: 'users', column: 'intro_seen_at', definition: 'DATETIME NULL' },
  { table: 'users', column: 'avatar_url', definition: 'VARCHAR(500) NULL' },
  { table: 'identities', column: 'avatar_url', definition: 'VARCHAR(500) NULL' },
];

async function ensureColumns() {
  for (const { table, column, definition } of COLUMNS) {
    const [rows] = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
      [table, column]
    );

    if (rows.length > 0) continue;

    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`ok ${table}.${column}`);
  }
}

async function main() {
  const sql = await readFile(join(here, 'schema.sql'), 'utf8');
  const statements = splitStatements(sql);

  for (const statement of statements) {
    const name = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1] ?? 'sentencia';
    await pool.query(statement);
    console.log(`ok ${name}`);
  }

  await ensureColumns();

  await pool.end();
  console.log(`${statements.length} sentencias aplicadas`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
