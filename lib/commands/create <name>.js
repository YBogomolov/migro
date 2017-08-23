'use strict';

const Promise = require('bluebird');
const debug = require('debug')('migro:command:create');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const pad = number => (number > 9 ? number.toString() : '0' + number.toString());

module.exports = async function (name) {
  debug(`create ${name}`);

  const versionsPath = path.join(this.parent.workingDir || process.cwd(), 'migrations');
  const stats = await fs.readdirAsync(versionsPath);
  const versionsDirs = stats.filter(entry => fs.statSync(path.join(versionsPath, entry)).isDirectory());
  versionsDirs.sort((a, b) => b.localeCompare(a));
  const lastVersion = versionsDirs[0];

  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const timePrefix = `${now.getFullYear()}${pad(month)}${pad(date)}${pad(hours)}${pad(minutes)}${pad(seconds)}`;
  const migrationFileName = path.join(this.parent.workingDir || process.cwd(), 'migrations', lastVersion, `${timePrefix}-${name}.js`);

  try {
    await fs.writeFileAsync(migrationFileName, '');
    console.log(`Created migration ${migrationFileName}`);
  } catch (err) {
    console.log(`Something happened during creation of migration ${migrationFileName}`);
    console.error(err);
  }
};
