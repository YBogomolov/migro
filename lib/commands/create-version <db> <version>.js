'use strict';

const Promise = require('bluebird');
const debug = require('debug')('migro:command:create-version');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

async function mkdir (dir, mode) {
  try {
    await this.fs.mkdirAsync(dir, mode);
  } catch (e) {
    if (e.code === 'ENOENT') {
      await mkdir.call(this, [path.dirname(dir), mode]);
      await mkdir.call(this, [dir, mode]);
    }
  }
}

module.exports = async function (db, version, options) {
  debug(`create-version ${db} ${version}`);
  this.fs = this.fs || fs;

  const versionPath = path.join(options.workingDir || process.cwd(), 'migrations', db, version);

  try {
    await mkdir.bind(this)(versionPath);
    console.log(`Path ${versionPath} successfully created.`);
  } catch (err) {
    debug(err);
    if (err.code === 'ENOENT' || err.code === 'EACCESS') {
      console.log(`Cannot create directory at path ${versionPath} due to access restrictions.`);
      return;
    }

    if (err.code === 'EEXIST') {
      console.log(`Path ${versionPath} already exists.`);
      return;
    }

    console.log(`Unknown error happened while creating ${versionPath}, details:`);
    console.error(err);
  }
};

module.exports.description = 'Create a new version under `migrations` directory.';
