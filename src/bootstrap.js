const config = require('config');
const util = require('util');
const path = require('path');
const express = require('express');
const SwaggerExpress = require('swagger-express-mw');

const log = require('./lib/log');
const Refresher = require('./lib/refresher');
const basicAuth = require('./lib/middleware/basicAuth');
const errors = require('./lib/middleware/errors');

module.exports.boot = async () => {

  const app = express();
  app.use((req, res, next) => {
    res.set('x-powered-by', 'hope');
    next();
  });
  app.set('trust proxy', true);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'app/views'));
  app.get('/', (req, res) => {
    res.render('pages/index');
  });
  app.get('/us', (req, res) => {
    res.render('pages/us');
  });
  app.get('/states', (req, res) => {
    res.render('pages/states');
  });

  const refresher = new Refresher();
  refresher.start();

  const swaggerCreateAsync = util.promisify(SwaggerExpress.create);
  const swaggerExpress = await swaggerCreateAsync({
    appRoot: __dirname,
    configDir: path.join(__dirname, '../config'),
    swaggerSecurityHandlers: {
      basicAuth
    }
  });
  swaggerExpress.register(app);

  // error handling middleware should be last
  app.use(errors(log, config.serviceName));

  return app;
};
