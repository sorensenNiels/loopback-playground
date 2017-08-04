'use strict';

const _ = require('lodash');
var loopback = require('loopback');
var boot     = require('loopback-boot');
var session  = require('express-session');
const MongoStore = require('connect-mongo')(session);
var myLogger = require('./middelware/logger.js');
var parseurl = require('parseurl');

var app = module.exports = loopback();

app.use(session({
  name: 'session',
  secret: 'verySecret',
  cookie: {
    secure: 'auto'
  },
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    host: 'zion',
    port: 32768,
    url: 'mongodb://zion:32768/loopback',
    datanase: 'loopback',
    user: '',
    password: '',
    ttl: (1 * 60 * 60),
    stringify: false
  }).on('create', (sessionId) => {
    console.log('Session created');
  })
}));

// Validate session information
app.use((req, res, next) => {
  // Validate ip address
  if (_.isUndefined(req.session.ip)) {
    req.session.ip = req.ip;
  }

  if (!req.session.views) {
    req.session.views = {};
  }

  // get the url pathname
  var pathname = parseurl(req).pathname;

  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;

  next();
});

app.use(myLogger({}));

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
