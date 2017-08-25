'use strict';

const debug = require('debug')('migro:drivers:pg');

const { Client } = require('pg');

const CREATE_MIGRATIONS_TABLE = `CREATE TABLE "_migrations" (
  id   SERIAL UNIQUE PRIMARY KEY,
  version VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP DEFAULT now()
);`;

const CHECK_MIGRATIONS_TABLE_EXISTENCE = `SELECT EXISTS (
  SELECT 1 
  FROM   pg_catalog.pg_class c
  JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE  n.nspname = 'public'
  AND    c.relname = '_migrations'
  AND    c.relkind = 'r'
);`;

const GET_LAST_VERSION_AND_MIGRATION = `SELECT
  version,
  name
FROM "_migrations"
ORDER BY id DESC
LIMIT 1`;

const INSERT_MIGRATION = `INSERT INTO "_migrations"(version, name)
VALUES ($1, $2);`;

class PostgresDriver {
  constructor (config) {
    this.config = config;
    this._pg = new Client(config);

    this._initialized = false;
  }

  getEngine () {
    return this._pg;
  }

  async init () {
    try {
      await this._pg.connect();

      const res = await this._pg.query(CHECK_MIGRATIONS_TABLE_EXISTENCE);

      if (res.rows[0].exists) {
        this._initialized = true;
        return;
      }

      await this._pg.query(CREATE_MIGRATIONS_TABLE);
      this._initialized = true;
    } catch (err) {
      this._lastError = err;
      debug(err);
      this._initialized = false;
    }
  }

  async getLastMigration () {
    debug('getLastMigration');

    if (!this._initialized) {
      await this.init();
    }

    const res = await this._pg.query(GET_LAST_VERSION_AND_MIGRATION);
    debug('last version & migration:', res.rows[0]);

    return {
      version: (res.rows[0] || {}).version,
      name: (res.rows[0] || {}).name
    };
  }

  async execute (version, name, fn) {
    if (!this._initialized) {
      await this.init();
    }

    await this._pg.query('BEGIN;');

    try {
      await fn(this._pg);
      await this._pg.query(INSERT_MIGRATION, [version, name]);
      await this._pg.query('COMMIT;');
    } catch (err) {
      debug(`Error during migration ${version}:${name}`, err);
      await this._pg.query('ROLLBACK;');
    }
  }

  async exit () {
    await this._pg.end();
  }
}

module.exports = PostgresDriver;
