'use strict';

const debug = require('debug')('migro:command:up-version');

const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));

const drivers = require('../drivers');
const pathUtils = require('../util/pathUtils');

module.exports = async function (db, command) {
  debug(`up-version ${db}`);
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
  const futureVersions = versionsDirs.filter(version => version > (lastMigration.version || ''));
  const nextVersion = futureVersions[0];

  debug('future version:', nextVersion);

  const currentVersionUnappliedMigrations = await pathUtils.getUnappliedMigrations.bind(this)(versionsPath, lastMigration.version, lastMigration.name);
  debug('currentVersionUnappliedMigrations', currentVersionUnappliedMigrations);

  const nextVersionUnappliedMigrations = await pathUtils.getUnappliedMigrations.bind(this)(versionsPath, nextVersion);
  debug('nextVersionUnappliedMigrations', nextVersionUnappliedMigrations);

  const versionToApply = currentVersionUnappliedMigrations.length > 0 ? lastMigration.version : nextVersion;
  const migrationsToApply = currentVersionUnappliedMigrations.length > 0 ? currentVersionUnappliedMigrations : nextVersionUnappliedMigrations;

  const currentVersionPath = path.join(versionsPath, versionToApply || lastMigration.version);

  if (migrationsToApply.length === 0) {
    console.log('No migrations to run, exiting...');
    await driver.exit();
    return;
  }

  for (let migration of migrationsToApply) {
    console.log('Running migration', versionToApply, ':', migration);
    const fileModule = require(path.join(currentVersionPath, migration));

    try {
      await driver.execute(versionToApply, migration, fileModule.up);
    } catch (err) {
      debug(err);
    }
  }

  await driver.exit();
  console.log('Done');
};

module.exports.description = 'Migrates the database to the latest migration of current version (of any) or to the latest migration of the next version otherwise.';
