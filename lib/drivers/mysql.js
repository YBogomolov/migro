'use strict';

const debug = require('debug')('migro:drivers:mysql');

const Promise = require('bluebird');
const mysql = require('mysql');

const queries = require('./queries');

class MySQLDriver {
  constructor (config) {
    this.config = config;
    this._mysql = Promise.promisifyAll(mysql.createConnection(config));

    this._initialized = false;
  }

  async init () {
    try {
      await this._mysql.connectAsync();

      const res = await this._mysql.queryAsync(queries.mysql.CHECK_MIGRATIONS_TABLE_EXISTENCE, [this.config.database]);

      if (res[0].exists) {
        this._initialized = true;
        return;
      }

      await this._mysql.queryAsync(queries.mysql.CREATE_MIGRATIONS_TABLE);
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

    const res = await this._mysql.queryAsync(queries.mysql.GET_LAST_VERSION_AND_MIGRATION);
    debug('last version & migration:', res[0]);

    return {
      version: (res[0] || {}).version,
      name: (res[0] || {}).name
    };
  }

  async getLastVersionMigrations () {
    debug('getLastVersionMigrations');

    if (!this._initialized) {
      await this.init();
    }

    const res = await this._mysql.queryAsync(queries.mysql.GET_LAST_VERSION_AND_ALL_ITS_MIGRATIONS);
    debug('last version & all its migration:', res);

    return res.map(row => ({
      version: (row || {}).version,
      name: (row || {}).name
    }));
  }

  async getLastNMigrations (count) {
    debug('getLastNMigrations');

    if (!this._initialized) {
      await this.init();
    }

    const res = await this._mysql.queryAsync(queries.mysql.GET_LAST_N_MIGRATIONS, [parseInt(count)]);
    debug(`last ${count} migrations`, res);

    return res.map(row => ({
      version: (row || {}).version,
      name: (row || {}).name
    }));
  }

  async execute (version, name, fn, isUp = true) {
    if (!this._initialized) {
      await this.init();
    }

    await this._mysql.queryAsync('START TRANSACTION;');

    try {
      await fn(this._mysql);
      await this._mysql.queryAsync(isUp ? queries.mysql.INSERT_MIGRATION : queries.mysql.DELETE_MIGRATION, [version, name]);
      await this._mysql.queryAsync('COMMIT;');
    } catch (err) {
      debug(`Error during migration ${version}:${name}`, err);
      await this._mysql.queryAsync('ROLLBACK;');
    }
  }

  async exit () {
    await this._mysql.endAsync();
  }
}

module.exports = MySQLDriver;
