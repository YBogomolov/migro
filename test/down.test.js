'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');
const path = require('path');

describe('migro down <db> <number>', () => {
  it('should have a description', () => {
    const command = require('../lib/commands/down');
    assert(command.description.length > 0);
  });

  const runDownFor = async number => {
    const driverMock = {
      init: sinon.stub().returns(Promise.resolve(true)),
      exit: sinon.stub().returns(Promise.resolve(true)),
      execute: sinon.stub().returns(Promise.resolve(true)),
      getLastNMigrations: sinon.stub().returns(Promise.resolve([{
        version: '0.0.0',
        name: '00000000000000-dummy.js'
      }]))
    };

    const readdirAsync = sinon.stub();
    readdirAsync.withArgs('/migrations/test').returns(Promise.resolve(['0.0.0']));
    readdirAsync.withArgs('/migrations/test/0.0.0').returns(Promise.resolve(['00000000000000-dummy.js']));

    const commandMock = {
      parent: {
        workingDir: path.join(__dirname, '/fixtures'),
        config: {}
      }
    };

    const command = require('../lib/commands/down').bind({
      drivers: {
        get: sinon.stub().returns(driverMock)
      }
    });

    await command('test', number, commandMock);
    assert(driverMock.init.calledOnce);
    assert(driverMock.getLastNMigrations.calledOnce);
    assert(driverMock.execute.calledOnce);
    assert(driverMock.exit.calledOnce);
  };

  it('should migrate the database down given number of times', async () => {
    await runDownFor(1);
  });

  it('should not fail if <number> is greater that count of applied migrations', async () => {
    await runDownFor(1000);
  });
});
