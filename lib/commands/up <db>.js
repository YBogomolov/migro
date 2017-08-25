'use strict';

const debug = require('debug')('migro:command:up');

const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));

const JS_FILE_REGEX = /.+\.js$/;

module.exports = async function (db, command) {
  debug(`up ${db}`);
  this.fs = this.fs || fs;

  const driver = new (command.parent.drivers[command.parent.driver])(command.parent.config[db]);
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
    let files = (await this.fs.readdirAsync(currentVersionPath)).filter(file => JS_FILE_REGEX.test(file)).filter(file => file > (lastMigration.name || ''));

    for (let migration of files) {
      debug('Running migration', version, ':', migration);
      const fileModule = require(path.join(currentVersionPath, migration));

      try {
        await driver.execute(version, migration, fileModule.up);
      } catch (err) {
        debug(err);
      }
    }
  }

  await driver.exit();
};

module.exports.description = 'Migrates the database to the latest version';
