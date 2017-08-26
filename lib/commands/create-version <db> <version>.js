'use strict';

const debug = require('debug')('migro:command:create-version');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = async function (db, version, command) {
  debug(`create-version ${db} ${version}`);
  this.mkdirp = this.mkdirp || mkdirp;

  const versionPath = path.join(command.parent.workingDir || process.cwd(), 'migrations', db, version);

  try {
    this.mkdirp.sync(versionPath);
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
