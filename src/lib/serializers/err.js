const bunyan = require('bunyan');

module.exports = function errSerializer(err) {
  return bunyan.stdSerializers.err(err);
};
