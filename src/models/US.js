const fs = require('fs');
const path = require('path');
const getStream = require('get-stream');
const csvParser = require('csv-parse');

const log = require('../lib/log');

let history = [];

class US {

  static updateHistory(data) {
    data.shift();

    // Because this will also update the history in place, we iterate over
    // the elements, looking for them in our current history. If we find a
    // match we update it; otherwise we add it.
    data.map(d => {
      return {
        date: d[0],
        cases: parseInt(d[1], 10),
        deaths: parseInt(d[2], 10),
      };
    }).forEach(d => {
      const index = history.findIndex((h) => h.date === d.date);

      if (index < 0) {
        history.push(d);
        return;
      }
      history[index] = d;
    });

    history.sort((d1, d2) => {
      if (d1.date < d2.date) {
        return -1;
      } else if (d1.date > d2.date) {
        return 1;
      }
      return 0;
    });

    return history;
  }

  static getHistory() {
    if (history.length !== 0) {
      return Promise.resolve(history);
    }

    const parseStream = csvParser({ delimiter: ',' });

    return getStream.array(
        fs.createReadStream(path.join(__dirname, './data/historical/us.csv')).pipe(parseStream)
      ).then((data) => {
        return US.updateHistory(data);
      });
  }

  static updateLive(data) {
    US.updateHistorical(data);
  }

  static updateHistorical(data) {
    csvParser(data, (err, output) => {
      if (err) {
        throw err;
      }
      US.updateHistory(output);
    });
  }

};

module.exports = US;
