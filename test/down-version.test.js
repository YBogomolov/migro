'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');
const path = require('path');

const driverMock = {
  init: sinon.stub().returns(Promise.resolve(true)),
  exit: sinon.stub().returns(Promise.resolve(true)),
  execute: sinon.stub().returns(Promise.resolve(true)),
  getLastVersionMigrations: sinon.stub().returns(Promise.resolve([{
    version: '0.0.0',
    name: '00000000000000-dummy.js'
  }]))
};

describe('migro down-version <db>', () => {
  it('should have a description', () => {
    const command = require('../lib/commands/down-version');
    assert(command.description.length > 0);
  });

  it('should migrate the database down only for the latest version', async () => {
    const readdirAsync = sinon.stub();
    readdirAsync.withArgs('/migrations/test').returns(Promise.resolve(['0.0.0']));
    readdirAsync.withArgs('/migrations/test/0.0.0').returns(Promise.resolve(['00000000000000-dummy.js']));

    const commandMock = {
      parent: {
        workingDir: path.join(__dirname, '/fixtures'),
        config: {}
      }
    };

    const command = require('../lib/commands/down-version').bind({
      drivers: {
        get: sinon.stub().returns(driverMock)
      }
    });

    await command('test', commandMock);
    assert(driverMock.init.calledOnce);
    assert(driverMock.getLastVersionMigrations.calledOnce);
    assert(driverMock.execute.calledOnce);
    assert(driverMock.exit.calledOnce);
  });
});
