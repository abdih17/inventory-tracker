'use strict';

const debug = require('debug')('inventory:server toggle');

module.exports = exports = {};

exports.startServer = function(server, done) {
  if (!server.running) {
    server.listen(process.env.PORT, () => {
      debug(`SERVER RUNNING ON PORT ${process.env.PORT}`);
      server.running = true;
      done();
    });
    return;
  }
  done();
}

exports.stopServer = function(server, done) {
  if (server.running) {
    server.close(err => {
      if (err) return done(err);
      debug(`SERVER CLOSED`);
      server.running = false;
      done();
    });
    return;
  }
  done();
};
