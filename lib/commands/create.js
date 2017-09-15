'use strict';

const Promise = require('bluebird');
const debug = require('debug')('migro:command:create');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const pad = number => (number > 9 ? number.toString() : '0' + number.toString());

const FILE_TEMPLATE = `'use strict';

exports.up = async db => {
  // write up migration here
};

exports.down = async db => {
  // write down migration here
};
`;

module.exports = async function (db, name, command) {
  debug(`create ${db} ${name}`);
  this.fs = this.fs || fs;

  const versionsPath = path.join(command.parent.workingDir || process.cwd(), 'migrations', db);
  const stats = await this.fs.readdirAsync(versionsPath);
  const versionsDirs = stats.filter(entry => this.fs.statSync(path.join(versionsPath, entry)).isDirectory());
  versionsDirs.sort((a, b) => b.localeCompare(a));
  const lastVersion = versionsDirs[0];

  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const timePrefix = this.timePrefixStub || `${now.getFullYear()}${pad(month)}${pad(date)}${pad(hours)}${pad(minutes)}${pad(seconds)}`;
  const migrationFileName = path.join(versionsPath, lastVersion, `${timePrefix}-${name}.js`);

  try {
    await this.fs.writeFileAsync(migrationFileName, FILE_TEMPLATE);
    console.log(`Created migration ${migrationFileName}`);
  } catch (err) {
    console.log(`Something happened during creation of migration ${migrationFileName}`);
    console.error(err);
  }
};

module.exports.command = 'create <db> <name>';
module.exports.description = 'Create a new migration with name <YYYYMMDDHHmmss>-<name>.js in the latest version.';
