const config = require('config');

const refresher = require('../../lib/refresher');

function get (req, res, next) {
  const refresherService = refresher.getRefresher();
  const refreshTime = refresherService.getLastRefreshTime();

  let url = config.app.urlBase;
  if (config.environment === 'development' && config.port) {
    url = `${url}:${config.port}`;
  }

  res.render('pages/us', {
    data: {
      config: {
        ...config.app,
        url,
      },
      refresher: {
        refreshTime,
      },
    },
  });
};


module.exports = get;