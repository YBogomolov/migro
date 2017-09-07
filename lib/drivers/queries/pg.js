'use strict';

module.exports = {
  CREATE_MIGRATIONS_TABLE: `CREATE TABLE "_migrations" (
    id   SERIAL UNIQUE PRIMARY KEY,
    version VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    date TIMESTAMP DEFAULT now()
  );`,

  CHECK_MIGRATIONS_TABLE_EXISTENCE: `SELECT EXISTS (
    SELECT 1 
    FROM   pg_catalog.pg_class c
    JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE  n.nspname = 'public'
    AND    c.relname = '_migrations'
    AND    c.relkind = 'r'
  );`,

  GET_LAST_VERSION_AND_MIGRATION: `SELECT
    version,
    name
  FROM "_migrations"
  ORDER BY id DESC
  LIMIT 1`,

  INSERT_MIGRATION: `INSERT INTO "_migrations"(version, name) VALUES ($1, $2);`,

  DELETE_MIGRATION: `DELETE FROM "_migrations" WHERE version = $1 AND name = $2;`
};
