'use strict';

const debug = require('debug')('migro:drivers:mongodb');

const MongoClient = require('mongodb').MongoClient;

// const queries = require('./queries');

class MongoDBDriver {
  constructor (config) {
    this.config = config;
    this._mongo = MongoClient.connect(this.config);

    this._initialized = false;
  }

  async init () {
    try {
      const res = await this._mongo.collection('_migrations');
      debug(res);
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

    // TODO: Get last migration
  }

  async getLastVersionMigrations () {}

  async getLastNMIgrations (count) {}

  async execute (version, name, fn, isUp = true) {}

  async exit () {
    await this._mongo.close();
  }
}

module.exports = MongoDBDriver;
