import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { encrypt, encryptJson } from './crypto.js';
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
  { table: 'notes', column: 'due_at', definition: 'DATETIME NULL' },
  { table: 'notes', column: 'title', definition: 'VARCHAR(500) NULL' },
  { table: 'notes', column: 'media', definition: 'TEXT NULL' },
  { table: 'notes', column: 'format', definition: 'TEXT NULL' },
  { table: 'notes', column: 'grade', definition: 'DECIMAL(6,2) NULL' },
  { table: 'notes', column: 'project_id', definition: 'CHAR(26) NULL' },
];

const INDEXES = [{ table: 'notes', name: 'notes_project', columns: 'project_id' }];

const TYPES = [
  { table: 'notes', column: 'hints', type: 'text', definition: 'TEXT NOT NULL' },
  { table: 'users', column: 'display_name', type: 'varchar', length: 500, definition: 'VARCHAR(500) NULL' },
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

async function ensureIndexes() {
  for (const { table, name, columns } of INDEXES) {
    const [rows] = await pool.query(
      `SELECT 1 FROM information_schema.statistics
       WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
      [table, name]
    );

    if (rows.length > 0) continue;

    await pool.query(`ALTER TABLE ${table} ADD INDEX ${name} (${columns})`);
    console.log(`ok indice ${table}.${name}`);
  }
}

async function ensureTypes() {
  for (const { table, column, type, length, definition } of TYPES) {
    const [rows] = await pool.query(
      `SELECT data_type, character_maximum_length FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
      [table, column]
    );

    const actual = rows[0];
    if (!actual) continue;

    const igual =
      actual.data_type === type &&
      (length === undefined || Number(actual.character_maximum_length) === length);

    if (igual) continue;

    await pool.query(`ALTER TABLE ${table} MODIFY COLUMN ${column} ${definition}`);
    console.log(`ok ${table}.${column} ahora es ${definition}`);
  }
}

async function cifrarPendientes() {
  const [notas] = await pool.query(
    "SELECT id, body, hints FROM notes WHERE body NOT LIKE 'v1.%'"
  );

  for (const nota of notas) {
    await pool.query('UPDATE notes SET body = ?, hints = ? WHERE id = ?', [
      encrypt(nota.body),
      encryptJson(typeof nota.hints === 'string' ? JSON.parse(nota.hints || '[]') : nota.hints),
      nota.id,
    ]);
  }

  const [usuarios] = await pool.query(
    "SELECT id, display_name FROM users WHERE display_name IS NOT NULL AND display_name NOT LIKE 'v1.%'"
  );

  for (const usuario of usuarios) {
    await pool.query('UPDATE users SET display_name = ? WHERE id = ?', [
      encrypt(usuario.display_name),
      usuario.id,
    ]);
  }

  if (notas.length > 0 || usuarios.length > 0) {
    console.log(`ok cifrado ${notas.length} notas y ${usuarios.length} nombres`);
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
  await ensureIndexes();
  await ensureTypes();
  await cifrarPendientes();

  await pool.end();
  console.log(`${statements.length} sentencias aplicadas`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
