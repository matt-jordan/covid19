const bunyan = require('bunyan');

module.exports = function reqSerializer (req) {
  return bunyan.stdSerializers.req(req);
};
