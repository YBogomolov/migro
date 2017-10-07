'use strict';

const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');

const MySQLDriver = require('../../lib/drivers/mysql');
const queries = require('../../lib/drivers/queries');

describe('MySQL driver', () => {
  it('should create a new mysql driver instance', async () => {
    const driver = new MySQLDriver({});

    assert(typeof driver === 'object');
    assert(driver._initialized === false);
  });

  it('should init the driver successfully', async () => {
    const driver = new MySQLDriver({});
    driver._mysql = {
      queryAsync: sinon.stub().returns(Promise.resolve([{ exists: false }])),
      connectAsync: sinon.stub().returns(Promise.resolve(true))
    };

    await driver.init();

    assert(driver._initialized);
    assert(driver._mysql.connectAsync.calledOnce);
    assert(driver._mysql.queryAsync.calledTwice);
    assert(driver._mysql.queryAsync.firstCall.calledWith(queries.mysql.CHECK_MIGRATIONS_TABLE_EXISTENCE));
    assert(driver._mysql.queryAsync.secondCall.calledWith(queries.mysql.CREATE_MIGRATIONS_TABLE));
  });

  it('should get the latest version & migration as undefined on empty DB', async () => {
    const driver = new MySQLDriver({});
    driver._mysql = {
      queryAsync: sinon.stub().returns(Promise.resolve({
        rows: [{ exists: false }]
      })),
      connectAsync: sinon.stub().returns(Promise.resolve(true))
    };

    const res = await driver.getLastMigration();
    assert(res.name === undefined);
    assert(res.version === undefined);
  });
});
