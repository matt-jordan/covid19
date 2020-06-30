module.exports = {
  environment: process.env.NODE_ENV || 'development',
  // keep alive set to 1 minute on incoming requests
  keepAliveInterval: 60000,
  log: {
    level: 'debug',
    logUncaughtException: true,
    pretty: true
  },
  app: {
    credentials: {
    },
    pollingTimer: 600,
  },
  port: 3000,
  serviceName: 'covid-service',
};
