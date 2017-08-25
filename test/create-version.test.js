'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');

describe('migro create-version <db> <version>', () => {
  it('should have a description', () => {
    const command = require('../lib/commands/create-version <db> <version>');
    assert(command.description.length > 0);
  });

  it('should create a file under correct path', async () => {
    const fsMock = {
      mkdirAsync: sinon.stub().returns(Promise.resolve(true))
    };

    const command = require('../lib/commands/create-version <db> <version>').bind({
      fs: fsMock
    });

    await command('test', '0.0.0', {
      parent: {
        workingDir: '/'
      }
    });

    assert(fsMock.mkdirAsync.calledOnce);
    assert(fsMock.mkdirAsync.calledWith('/migrations/test/0.0.0'));
  });
});
