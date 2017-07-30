'use strict';

const midelware = require('loopback').static;

module.exports = function addStatic(app) {
  app.use('/static', midelware('public'));
};
