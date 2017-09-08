'use strict';

const debug = require('debug')('migro:command:up');

const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));

const drivers = require('../drivers');
const pathUtils = require('../util/pathUtils');

module.exports = async function (db, command) {
  debug(`up ${db}`);
  this.fs = this.fs || fs;
  this.drivers = this.drivers || drivers;

  const config = Object.assign({ database: db }, ((command.parent.config || {}).database || {})[db] || {});
  const driver = this.drivers.get(command.parent.driver, config);
  await driver.init();

  const lastMigration = await driver.getLastMigration();
  debug(lastMigration);

  const versionsPath = path.join(command.parent.workingDir || process.cwd(), 'migrations', db);
  const stats = await this.fs.readdirAsync(versionsPath);
  const versionsDirs = stats.filter(entry => this.fs.statSync(path.join(versionsPath, entry)).isDirectory());
  versionsDirs.sort((a, b) => a.localeCompare(b));
  const versionsToApply = versionsDirs.filter(version => version >= (lastMigration.version || ''));

  debug('versions to apply:', versionsToApply);

  for (let version of versionsToApply) {
    const currentVersionPath = path.join(versionsPath, version);
    const files = await pathUtils.getUnappliedMigrations.bind(this)(versionsPath, version, lastMigration.name, lastMigration.version);

    for (let migration of files) {
      console.log(`Running migration for version ${version}: ${migration}`);
      const fileModule = require(path.join(currentVersionPath, migration));

      try {
        await driver.execute(version, migration, fileModule.up);
      } catch (err) {
        debug(err);
      }
    }
  }

  await driver.exit();
  console.log('Done');
};

module.exports.description = 'Migrates the database to the latest version.';
