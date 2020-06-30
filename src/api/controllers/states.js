
const State = require('../../models/State');

function listStates (req, res) {

  State.getLastHistory()
    .then((history) => {
      res.json({
        items: history
      });
    });

}

module.exports = {
  listStates,
}