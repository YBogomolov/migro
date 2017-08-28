'use strict';

const drivers = require('require-directory')(module);

module.exports = {
  get: (name, config) => {
    const Driver = drivers[name];
    return new Driver(config);
  }
};
