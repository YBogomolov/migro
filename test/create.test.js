'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');

describe('migro create <db> <name>', () => {
  it('should have a description', () => {
    const command = require('../lib/commands/create <db> <name>');
    assert(command.description.length > 0);
  });

  it('should create a file under correct path', async () => {
    const fsMock = {
      writeFileAsync: sinon.stub().returns(Promise.resolve(true)),
      statSync: () => ({
        isDirectory: () => true
      }),
      readdirAsync: sinon.stub().returns(['0.0.0'])
    };

    const command = require('../lib/commands/create <db> <name>').bind({
      parent: {
        workingDir: '/'
      },
      fs: fsMock,
      timePrefixStub: '00000000000000'
    });

    await command('test', 'my-migration');

    assert(fsMock.writeFileAsync.calledOnce);
    assert(fsMock.writeFileAsync.calledWith('/migrations/test/0.0.0/00000000000000-my-migration.js'));
  });
});
