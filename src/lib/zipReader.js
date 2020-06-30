const yauzl = require('yauzl');

const log = require('./log');

/**
 * Opens a Zip file for reading (wrapped in a Promise)
 *
 * @returns Promise that resolves with a Zip file object
 */
function openZipFile (path) {

  const zipPromise = new Promise((resolve, reject) => {
    yauzl.open(path, { lazyEntries: true }, (err, zipFile) => {
      if (err) {
        log.error({ err, path }, 'Failed to open file for unzipping');
        reject(err);
        return;
      }

      zipFile.on('error', (err) => {
        reject(err);
      });

      resolve(zipFile);
    });
  });

  return zipPromise;
}

/**
 * Read contents of the Zip File
 *
 * @param zipFile The file to read
 * @param filter A callback function that is passed an entry. Returning true
 *               will cause that entry to be skipped.
 * @param cb     A callback function passed the stringified data
 *
 * @returns Promise
 */
function readZipFile (zipFile, filter, cb) {
  const zipPromise = new Promise((resolve, reject) => {

    zipFile.readEntry();

    zipFile.on('entry', (entry) => {
      const zipFileName = entry.fileName;

      if (filter && filter(entry)) {
        log.debug({ zipFileName }, 'Skipping');
        zipFile.readEntry();
        return;
      }

      log.debug({ zipFileName }, 'Processing');

      let contents = '';
      zipFile.openReadStream(entry, (err, readStream) => {
        if (err) {
          reject(err);
          return;
        }

        readStream.on('end', () => {
          cb(zipFileName, contents);

          log.debug({ zipFileName }, 'Finished');
          zipFile.readEntry();
        });

        readStream.on('data', (chunk) => {
          const decoded = Buffer.from(chunk).toString();

          contents += decoded;
          log.debug({ zipFileName, length: chunk.length }, 'Read');
        });
      });
    });

    zipFile.on('end', () => {
      resolve();
    });
  });

  return zipPromise ;
}

module.exports = {
  openZipFile,
  readZipFile,
};