
const refresher = require('../../lib/refresher');

function get (req, res, next) {
  const refresherService = refresher.getRefresher();
  const refreshTime = refresherService.getLastRefreshTime();

  res.render('pages/us', {
    data: {
      refresher: {
        refreshTime,
      },
    },
  });
};


module.exports = get;