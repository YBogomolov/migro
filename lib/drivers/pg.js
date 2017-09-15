'use strict';

const debug = require('debug')('migro:drivers:pg');

const { Client } = require('pg');

const queries = require('./queries');

class PostgresDriver {
  constructor (config) {
    this.config = config;
    this._pg = new Client(config);

    this._initialized = false;
  }

  async init () {
    try {
      await this._pg.connect();

      const res = await this._pg.query(queries.pg.CHECK_MIGRATIONS_TABLE_EXISTENCE);

      if (res.rows[0].exists) {
        this._initialized = true;
        return;
      }

      await this._pg.query(queries.pg.CREATE_MIGRATIONS_TABLE);
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

    const res = await this._pg.query(queries.pg.GET_LAST_VERSION_AND_MIGRATION);
    debug('last version & migration:', res.rows[0]);

    return {
      version: (res.rows[0] || {}).version,
      name: (res.rows[0] || {}).name
    };
  }

  async getLastVersionMigrations () {
    debug('getLastVersionMigrations');

    if (!this._initialized) {
      await this.init();
    }

    const res = await this._pg.query(queries.pg.GET_LAST_VERSION_AND_ALL_ITS_MIGRATIONS);
    debug('last version & all its migration:', res.rows);

    return res.rows.map(row => ({
      version: (row || {}).version,
      name: (row || {}).name
    }));
  }

  async getLastNMigrations (count) {
    debug('getLastNMigrations');

    if (!this._initialized) {
      await this.init();
    }

    const res = await this._pg.query(queries.pg.GET_LAST_N_MIGRATIONS, [count]);
    debug(`last ${count} migrations`, res.rows);

    return res.rows.map(row => ({
      version: (row || {}).version,
      name: (row || {}).name
    }));
  }

  async execute (version, name, fn, isUp = true) {
    if (!this._initialized) {
      await this.init();
    }

    await this._pg.query('BEGIN;');

    try {
      await fn(this._pg);
      await this._pg.query(isUp ? queries.pg.INSERT_MIGRATION : queries.pg.DELETE_MIGRATION, [version, name]);
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
