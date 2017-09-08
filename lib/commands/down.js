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

  for (let i = 0; i < number; ++i) {
    const lastMigration = await driver.getLastMigration();
    debug(lastMigration);
    console.log(`Rolling back migration for version ${lastMigration.version}: ${lastMigration.name}`);

    const migrationPath = path.join(command.parent.workingDir || process.cwd(), 'migrations', db, lastMigration.version, lastMigration.name);
    const fileModule = require(migrationPath);

    try {
      await driver.execute(lastMigration.version, lastMigration.name, fileModule.down, false);
    } catch (err) {
      debug(err);
    }
  }

  await driver.exit();
  console.log('Done');
};

module.exports.command = 'down <db> <number>';
module.exports.description = 'Migrates the database down specified number of times.';
