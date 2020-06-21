const http = require('http');
const httpShutdown = require('http-shutdown');

const bootstrap = require('../src/bootstrap');

function startServer(app) {
  return new Promise(resolve => {
    server = httpShutdown(http.createServer(app));
    server.listen(0, () => resolve(server));
  });
}

let server;

before(async function() {
  const app = await bootstrap.boot();
  server = await startServer(app);
});

after(async function () {
  if (server) {
    await server.shutdown();
  }
});
