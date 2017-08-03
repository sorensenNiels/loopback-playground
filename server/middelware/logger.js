'use strict';

const moment = require('moment');

module.exports = function(options) {

  return function(req, res, next) {
    var timestamp = moment();
    console.log(`${timestamp} - url: ${req.url}`);
    next();
  };
};
