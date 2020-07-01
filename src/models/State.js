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

    // Because this will also update the history in place, we iterate over
    // the elements, looking for them in our current history. If we find a
    // match we update it; otherwise we add it.
    data.map(d => {
      return {
        date: d[0],
        state: d[1],
        stateIndex: parseInt(d[2], 10),
        cases: parseInt(d[3], 10),
        deaths: parseInt(d[4], 10),
      };
    }).forEach(d => {
      const index = _history.findIndex((h) => h.date === d.date && h.state === d.state);

      if (index < 0) {
        _history.push(d);
        return;
      }
      _history[index] = d;
    });

    _history.sort((d1, d2) => {
      if (d1.date < d2.date) {
        return -1;
      } else if (d1.date > d2.date) {
        return 1;
      }

      if (d1.stateIndex < d2.stateIndex) {
        return -1;
      } else if (d1.stateIndex > d2.stateIndex) {
        return 1;
      }
      return 0;
    });

    return _history;
  }

  /**
   * Get history for states
   *
   * @param filter If defined, apply a filter to the results
   *
   * @returns Promise(history)
   */
  static getHistory(filter) {
    let historyPromise;

    if (_history.length !== 0) {
      historyPromise = Promise.resolve(_history);
    } else {
      const parseStream = csvParser({ delimiter: ',' });

      historyPromise = getStream.array(
          fs.createReadStream(path.join(__dirname, './data/historical/us-states.csv')).pipe(parseStream)
        ).then((data) => {
          return State.updateHistory(data);
        });
    }

    return historyPromise
      .then((history) => {
        if (filter) {
          if (filter.date) {
            history = history.filter(d => d.date === filter.date);
          }
          if (filter.state) {
            history = history.filter(d => d.state === filter.state);
          }
        }

        return history;
      });
  }

  static updateLive(data) {
    State.updateHistorical(data);
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
