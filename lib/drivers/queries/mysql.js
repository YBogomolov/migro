'use strict';

module.exports = {
  CREATE_MIGRATIONS_TABLE: `CREATE TABLE \`_migrations\` (
    id   SERIAL UNIQUE PRIMARY KEY,
    version VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    date TIMESTAMP DEFAULT now()
  );`,

  CHECK_MIGRATIONS_TABLE_EXISTENCE: `SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables
    WHERE table_schema = ? 
        AND table_name = '_migrations'
  ) as \`exists\`;`,

  GET_LAST_VERSION_AND_MIGRATION: `SELECT
    version,
    name
  FROM \`_migrations\`
  ORDER BY id DESC
  LIMIT 1`,

  GET_LAST_VERSION_AND_ALL_ITS_MIGRATIONS: `SELECT
    version,
    name
  FROM
    (
      SELECT
        id,
        version,
        name,
        (select max(version) from \`_migrations\`) max_version
      FROM \`_migrations\`
    ) t
  WHERE t.version = t.max_version
  ORDER BY id DESC;`,

  GET_LAST_N_MIGRATIONS: `SELECT
    version,
    name
  FROM \`_migrations\`
  ORDER BY id DESC
  LIMIT ?;`,

  INSERT_MIGRATION: `INSERT INTO \`_migrations\`(version, name) VALUES (?, ?);`,

  DELETE_MIGRATION: `DELETE FROM \`_migrations\` WHERE version = ? AND name = ?;`
};
