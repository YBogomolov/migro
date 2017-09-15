'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');

describe('migro create-version <db> <version>', () => {
  it('should have a description', () => {
    const command = require('../lib/commands/create-version');
    assert(command.description.length > 0);
  });

  it('should create a file under correct path', async () => {
    const mkdirp = {
      sync: sinon.stub().returns(Promise.resolve(true))
    };

    const command = require('../lib/commands/create-version').bind({
      mkdirp: mkdirp
    });

    await command('test', '0.0.0', {
      parent: {
        workingDir: '/'
      }
    });

    assert(mkdirp.sync.calledOnce);
    assert(mkdirp.sync.calledWith('/migrations/test/0.0.0'));
  });
});
