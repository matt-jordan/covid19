process.title = 'covid-server';

const config = require('config');
const http = require('http');
const httpShutdown = require('http-shutdown');

const bootstrap = require('./src/bootstrap');
const log = require('./src/lib/log');

bootstrap.boot()
  .then(app => new Promise((resolve, reject) => {
    const server = httpShutdown(http.createServer(app));

    server.setTimeout(0);
    server.on('connection', socket => socket.setKeepAlive(true, config.keepAliveInterval));
    server.on('error', reject);

    server.listen(config.port, () => {
      log.info({ address: server.address(), port: config.port }, 'HTTP server listening');
      resolve();
    });

    ['SIGUSR2', 'SIGINT', 'SIGTERM'].forEach(signal =>
      process.once(signal, () => {
        log.info({ signal }, 'Shutting down');

        server.shutdown(() => {
          log.info({ signal }, 'Server shut down');
          process.kill(process.pid, signal);
        });
      }));
  }))
  .catch((err) => {
    console.log(err);
    log.error({ err });
    process.exit();
  });
