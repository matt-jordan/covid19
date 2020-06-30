const fs = require('fs');
const path = require('path');
const getStream = require('get-stream');
const csvParser = require('csv-parse');

let history = [];

class US {

  static updateHistory(data) {
    data.shift();

    history = data.map(d => {
      return {
        date: d[0],
        cases: parseInt(d[1], 10),
        deaths: parseInt(d[2], 10),
      };
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
