module.exports = {
  port: {
    __name: 'CUSTOM_PORT',
    __format: 'yml'
  },
  environment: 'NODE_ENV',
  app: {
    urlBase: 'APP_URL_BASE',
    credentials: {
      name: 'APP_USERNAME',
      password: 'APP_PASSWORD',
    },
  },
  log: {
    level: 'LOG_LEVEL',
    pretty: {
      __name: 'LOG_PRETTY',
      __format: 'yml'
    }
  }
};
