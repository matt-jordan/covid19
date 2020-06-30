const fs = require('fs');
const path = require('path');
const getStream = require('get-stream');
const csvParser = require('csv-parse');

let _history = [];
const _stateHistory = {};

class State {

  static getStateHistory(state) {
    if (_stateHistory[state]) {
      return _stateHistory[state];
    }

    _stateHistory[state] = history.filter(d => d.state === state);
  }

  static getLastHistory() {
    return State.getHistory()
      .then((history) => {
        const lastDate = history[history.length - 1].date;

        return history.filter(d => d.date === lastDate);
      });
  }

  static updateHistory(data) {
    data.shift();

    _history = data.map(d => {
      return {
        date: d[0],
        state: d[1],
        stateIndex: parseInt(d[2], 10),
        cases: parseInt(d[3], 10),
        deaths: parseInt(d[4], 10),
      };
    });

    return _history;
  }

  static getHistory() {
    if (_history.length !== 0) {
      return Promise.resolve(_history);
    }

    const parseStream = csvParser({ delimiter: ',' });

    return getStream.array(
        fs.createReadStream(path.join(__dirname, './data/historical/us-states.csv')).pipe(parseStream)
      ).then((data) => {
        return State.updateHistory(data);
      });
  }

  static updateLive(data) {

  }

  static updateHistorical(data) {
    csvParser(data, (err, output) => {
      if (err) {
        throw err;
      }
      State.updateHistory(output);
    });
  }
};

module.exports = State;
