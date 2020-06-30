const config = require('config');
const https = require('follow-redirects').https;
const fs = require('fs');

const { openZipFile, readZipFile } = require('./zipReader');
const State = require('../models/State');
const US = require('../models/US');

const log = require('./log');

const DEFAULT_POLLING_TIMER = 600;

const DATA_FILE_LOCATION = "https://github.com/nytimes/covid-19-data/archive/master.zip";

const DOWNLOADED_DATA_FILE = "/tmp/covid-data.zip";

const FILES = {
  'covid-19-data-master/live/us-counties.csv': null,
  'covid-19-data-master/live/us-states.csv': State.updateLive,
  'covid-19-data-master/live/us.csv': US.updateLive,
  'covid-19-data-master/us-counties.csv': null,
  'covid-19-data-master/us-states.csv': State.updateHistorical,
  'covid-19-data-master/us.csv': US.updateHistorical,
};

class Refresher {

  constructor() {
    this.intervalHandler = null;
  }

  refreshData() {
    const currentTime = new Date();
    const dataFile = DOWNLOADED_DATA_FILE;

    const unlinkPromise = new Promise((resolve, reject) => {
      fs.access(dataFile, fs.constants.F_OK, (err) => {
        if (err) {
          resolve();
          return;
        }

        log.debug({ dataFile }, 'File exists; removing');
        fs.unlink(dataFile, (err) => {
          if (err) {
            log.error({ err, dataFile }, 'Failed to remove file');
            reject(err);
            return;
          }
          log.debug({ dataFile }, 'File removed');
          resolve();
        });
      });
    });

    return unlinkPromise
      .then(() => {
        const downloadPromise = new Promise((resolve, reject) => {
          log.info({ currentTime: currentTime.toISOString() }, 'Pulling new data');
          const file = fs.createWriteStream(dataFile)
          https.get(DATA_FILE_LOCATION, (response) => {
            response
              .pipe(file)
              .on('finish', () => {
                log.debug({ dataFile }, 'File written');
                file.close();
                resolve();
              });
          }).on('error', (err) => {
            log.error({ err, dataFile }, 'Failed to stream file');
            fs.unlink(dataFile);
            reject();
          });
        });

        return downloadPromise;
      })
      .then(() => {
        return openZipFile(dataFile);
      })
      .then((zipFile) => {
        return readZipFile(
          zipFile,
          (entry) => !(entry.fileName in FILES),
          (fileName, data) => {
            if (FILES[fileName]) {
              FILES[fileName](data);
            }
          });
      });
  }

  start() {
    const refreshTime = config.app.pollingTimer || DEFAULT_POLLING_TIMER;

    log.info({ refreshTime }, 'Starting data refresher');
    this.intervalHandler = setInterval(
      this.refreshData,
      refreshTime * 1000
    );
    this.refreshData();
  }

  stop() {
    if (!this.intervalHandler) {
      return;
    }
    clearInterval(this.intervalHandler);
    log.info('Data refresher stopped');
  }

}


module.exports = Refresher;