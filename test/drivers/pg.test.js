'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');

const PGDriver = require('../../lib/drivers/pg');
const SQL = require('../../lib/util/sql');

describe('PG driver', () => {
  it('should create a new PG driver instance', async () => {
    const pg = new PGDriver({});

    assert(typeof pg === 'object');
    assert(pg._initialized === false);
  });

  it('should init the driver successfully', async () => {
    const pg = new PGDriver({});
    pg._pg = {
      query: sinon.stub().returns(Promise.resolve({
        rows: [{ exists: false }]
      })),
      connect: sinon.stub().returns(Promise.resolve(true))
    };

    await pg.init();

    assert(pg._initialized);
    assert(pg._pg.connect.calledOnce);
    assert(pg._pg.query.calledTwice);
    assert(pg._pg.query.firstCall.calledWith(SQL.pg.CHECK_MIGRATIONS_TABLE_EXISTENCE));
    assert(pg._pg.query.secondCall.calledWith(SQL.pg.CREATE_MIGRATIONS_TABLE));
  });

  it('should get the latest version & migration as undefined on empty DB', async () => {
    const pg = new PGDriver({});
    pg._pg = {
      query: sinon.stub().returns(Promise.resolve({
        rows: [{ exists: false }]
      })),
      connect: sinon.stub().returns(Promise.resolve(true))
    };

    const res = await pg.getLastMigration();
    assert(res.name === undefined);
    assert(res.version === undefined);
  });
});
