const bunyan = require('bunyan');

module.exports = function resSerializer (res) {
  return bunyan.stdSerializers.res(res);
};
