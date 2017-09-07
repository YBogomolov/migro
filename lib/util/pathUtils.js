'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const JS_FILE_REGEX = /.+\.js$/;

async function getUnappliedMigrations (versionsPath, version, lastMigrationName, lastMigrationVersion) {
  const currentVersionPath = path.join(versionsPath || '/', version || '');
  let files = (await (this.fs || fs).readdirAsync(currentVersionPath))
      .filter(file => JS_FILE_REGEX.test(file))
      .filter(file => (file > (lastMigrationName || '')) || (version > (lastMigrationVersion || '')));

  return files;
}

module.exports = {
  getUnappliedMigrations: getUnappliedMigrations
};
