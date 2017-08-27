'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');
const path = require('path');

describe('migro up <db>', () => {
  it('should have a description', () => {
    const command = require('../lib/commands/up <db>');
    assert(command.description.length > 0);
  });

  it('should migrate the database up to the last version', async () => {
    const readdirAsync = sinon.stub();
    readdirAsync.withArgs('/migrations/test').returns(Promise.resolve(['0.0.0']));
    readdirAsync.withArgs('/migrations/test/0.0.0').returns(Promise.resolve(['00000000000000-dummy.js']));

    function DriverMock () {}
    DriverMock.prototype.init = sinon.stub().returns(Promise.resolve(true));
    DriverMock.prototype.getLastMigration = sinon.stub().returns(Promise.resolve({
      version: undefined,
      name: undefined
    }));
    DriverMock.prototype.exit = sinon.stub().returns(Promise.resolve(true));

    const driverMock = new DriverMock();

    const commandMock = {
      parent: {
        workingDir: path.join(__dirname, '/fixtures'),
        config: {},
        driver: 'test',
        drivers: {
          test: DriverMock
        }
      }
    };

    const command = require('../lib/commands/up <db>').bind({
      drivers: {
        get: sinon.stub().returns(driverMock)
      }
    });

    await command('test', commandMock);
    assert(driverMock.init.calledOnce);
    assert(driverMock.getLastMigration.calledOnce);
  });
});
