
const US = require('../../models/US');

function getHistory (req, res) {
  const country = req.swagger.params.pathCountry.value;

  // Eventually, we should have a country Model that does the lookup.
  // For now, we simply reject requests with a 404 if something other
  // than the US is asked for.
  if (country !== 'US') {
    res.status(404).send({ message: 'Not Found' });
    return;
  }

  US.getHistory()
    .then((history) => {

      res.json({
        name: 'US',
        items: history
      });
    });
}

module.exports = {
  getHistory,
}