
const assert = require('assert');
const config = require('config');

const AppCredentials = require('../../src/models/AppCredentials');

describe('AppCredentials', () => {

  describe('when validating', () => {
    let uut;

    beforeEach(() => {
      uut = new AppCredentials({
        name: 'foo',
        password: 'secret',
      });
    });

    it('returns false if the password does not match', async () => {
      const result = await uut.comparePassword('bar');

      assert(result === false);
    });

    it('return true if the password matches', async () => {
      const result = await uut.comparePassword('secret');

      assert(result === true);
    });
  });

  describe('findByAppName', () => {
    it('returns the configured AppCredentials when the name matches', async () => {
      const result = await AppCredentials.findByAppName('test');

      assert(result.name === config.app.credentials.name);
      assert(result.password === config.app.credentials.password);
    });

    it('rejects if not found', async () => {
      let exceptionThrown = false;
      try {
        const result = await AppCredentials.findByAppName('wat');
      } catch {
        exceptionThrown = true;
      }
      assert(exceptionThrown);
    });
  });
});
