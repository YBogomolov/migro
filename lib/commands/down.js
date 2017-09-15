'use strict';

const debug = require('debug')('migro:command:down');

const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));

const drivers = require('../drivers');

module.exports = async function (db, number, command) {
  debug(`down ${db} ${number}`);
  this.fs = this.fs || fs;
  this.drivers = this.drivers || drivers;

  const config = Object.assign({ database: db }, ((command.parent.config || {}).database || {})[db] || {});
  const driver = this.drivers.get(command.parent.driver, config);
  await driver.init();

  const migrationsToRollback = await driver.getLastNMigrations(number || 1);
  debug('migrationsToRollback', migrationsToRollback);

  for (let migration of migrationsToRollback) {
    console.log(`Rolling back migration for version ${migration.version}: ${migration.name}`);

    const migrationPath = path.join(command.parent.workingDir || process.cwd(), 'migrations', db, migration.version, migration.name);
    const fileModule = require(migrationPath);

    try {
      await driver.execute(migration.version, migration.name, fileModule.down, false);
    } catch (err) {
      debug(err);
    }
  }

  await driver.exit();
  console.log('Done');
};

module.exports.command = 'down <db> <number>';
module.exports.description = 'Migrates the database down specified number of times.';
