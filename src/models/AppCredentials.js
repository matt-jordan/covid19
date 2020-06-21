const config = require('config');
const Bcrypt = require('bcrypt');

const log = require('../lib/log');

/**
 * Hashes the provided password.
 *
 * @returns {Promise}
 */
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const clear = password;
    Bcrypt.hash(clear, 10, (err, hash) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(hash);
    });
  });
}

class AppCredentials {

  /**
   * Constructor
   *
   * @param {Object[name] String} The name to match on
   * @param {Object[password] String} The raw password
   */
  constructor(credentials) {
    this.name = credentials.name;
    this.password = credentials.password;
  }

  /**
  * Returns true if the given password matches the hashed password in the password property.
  *
  * @param password
  * @returns {Promise.<boolean>}
  */
  comparePassword(password) {
    return hashPassword(this.password)
      .then((hashedPassword) => {
        return new Promise((resolve, reject) => {
          Bcrypt.compare(password, hashedPassword, (err, res) => {
            if (err) {
              reject(err);
              return;
            }

            if (res) {
              resolve(true);
              return;
            }

            resolve(false);
          });
        });
      });
  }

  /**
   * Find Application credentials by their name
   *
   * @param {String} appname The application name to match on
   *
   * @returns {Promise} Resolves with the credentials if a match is found
   */
  static findByAppName(appname) {
    // When we have a more secure mechanism (using, say, a database),
    // replace this. For now, we look to our injected application credentials
    // provided in the Docker container.
    if (!config.app || !config.app.credentials || !config.app.credentials.name) {
      log.error('Missing application credentials in configuration');
      return Promise.reject(null);
    }

    if (config.app.credentials.name !== appname) {
      return Promise.reject(null);
    }

    return Promise.resolve(
      new AppCredentials(config.app.credentials)
    );
  }

}

module.exports = AppCredentials;
