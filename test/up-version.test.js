'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');
const path = require('path');

const driverMock = {
  init: sinon.stub().returns(Promise.resolve(true)),
  exit: sinon.stub().returns(Promise.resolve(true)),
  execute: sinon.stub().returns(Promise.resolve(true)),
  getLastMigration: sinon.stub().returns(Promise.resolve({
    version: undefined,
    name: undefined
  }))
};

describe('migro up-version <db>', () => {
  it('should have a description', () => {
    const command = require('../lib/commands/up-version');
    assert(command.description.length > 0);
  });

  it('should migrate the database up to the last migration of the current version', async () => {
    const readdirAsync = sinon.stub();
    readdirAsync.withArgs('/migrations/test').returns(Promise.resolve(['0.0.0', '0.0.1']));
    readdirAsync.withArgs('/migrations/test/0.0.0').returns(Promise.resolve(['00000000000000-dummy.js']));
    readdirAsync.withArgs('/migrations/test/0.0.1').returns(Promise.resolve(['00000000000001-dimmy.js']));

    const commandMock = {
      parent: {
        workingDir: path.join(__dirname, '/fixtures'),
        config: {}
      }
    };

    const command = require('../lib/commands/up-version').bind({
      drivers: {
        get: sinon.stub().returns(driverMock)
      }
    });

    await command('test', commandMock);
    assert(driverMock.init.calledOnce);
    assert(driverMock.getLastMigration.calledOnce);
    assert(driverMock.execute.calledOnce);
    assert(driverMock.exit.calledOnce);

    driverMock.getLastMigration = driverMock.getLastMigration.returns(Promise.resolve({
      version: '0.0.0',
      name: '00000000000000-dummy.js'
    }));

    await command('test', commandMock);
    assert(driverMock.init.calledTwice);
    assert(driverMock.getLastMigration.calledTwice);
    assert(driverMock.execute.calledTwice);
    assert(driverMock.exit.calledTwice);
  });
});
