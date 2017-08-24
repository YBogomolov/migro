'use strict';

const Promise = require('bluebird');
const debug = require('debug')('migro:command:create-version');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

async function mkdir (dir, mode) {
  try {
    await fs.mkdirAsync(dir, mode);
  } catch (e) {
    if (e.code === 'ENOENT') {
      await mkdir(path.dirname(dir), mode);
      await mkdir(dir, mode);
    }
  }
}

module.exports = async function (version) {
  debug(`create-version ${version}`);

  const versionPath = path.join(this.parent.workingDir || process.cwd(), 'migrations', version);

  try {
    await mkdir(versionPath);
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
