module.exports = {
  environment: 'test',
  log: {
    level: 'silent',
    logUncaughtException: false
  },
  app: {
    credentials: {
      name: 'test',
      password: 'not-secret'
    }
  }
};
