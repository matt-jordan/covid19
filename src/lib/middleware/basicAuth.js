const log = require('../log');
const auth = require('basic-auth');
const AppCredentials = require('../../models/AppCredentials');

function basicAuth (req, res, next) {
  const err401 = {
    statusCode: 401,
    message: 'Access Denied',
  };
  const credentials = auth(req);

  if (!credentials) {
    log.debug({ req }, 'No authentication provided');
    next(err401);
    return;
  }

  AppCredentials.findByAppName(credentials.name)
    .then((app) => {
      if (!app) {
        log.debug({ req, appName: credentials.name }, 'No credentials found');
        next(err401);
        return;
      }

      return app.comparePassword(credentials.pass)
        .then((result) => {
          if (!result) {
            log.debug({ req, appName: credentials.name }, 'Password mismatch');
            next(err401);
            return;
          }

          next();
        });
    })
    .catch((err) => {
      log.warn({ req, err });
      next(err401);
    });
}

module.exports = basicAuth;
