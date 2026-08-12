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

async function main() {
  const sql = await readFile(join(here, 'schema.sql'), 'utf8');
  const statements = splitStatements(sql);

  for (const statement of statements) {
    const name = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1] ?? 'sentencia';
    await pool.query(statement);
    console.log(`ok ${name}`);
  }

  await pool.end();
  console.log(`${statements.length} sentencias aplicadas`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
