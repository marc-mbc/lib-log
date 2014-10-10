'use strict';
module.exports.init = function(config) {
  if (!config || typeof config !== 'object') throw new Error('You must set a config object');
  if (!config.log || typeof config.log !== 'object') throw new Error('You must set a log config object');

  var base = config.log.base || '';
  var levels = config.log.levels;

  var streams = [];

  if (levels)
  {
    for (var level in levels) {
      if (levels.hasOwnProperty(level)) {
        streams.push({
          level: level,               
          path: base + levels[level]
        });
      }
    }
  }
  // Default stream
  if (!levels || !levels.debug) {
    streams.push({
      level: 'debug',
      stream: process.stdout,
    });
  }
  var bunyan = require('bunyan');
  var log = bunyan.createLogger({
    name: config.server.name,
    src: config.log.log_src,
    streams: streams,
    serializers: bunyan.stdSerializers
  });

  function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
  }
  /*
  * Add new arguments to logs
   */
  function overwrite_level(log, level)
  {
    log['orig_' + level] = log[level];
    log[level] = function () {
      if (arguments[0])
      {
        if (typeof arguments[0] === 'object')
        {
          arguments[0].time = new Date().toLocaleString();
        }
        else
        {
          var tmp = arguments[0];
          arguments[0] = {
            data: tmp
          };
        }
      }
      else
      {
        arguments[0] = {};
      }
      arguments[0].time = convertUTCDateToLocalDate(new Date());
      log['orig_' + level].apply(log, Array.prototype.slice.call(arguments));
    };
    return log;
  }
  var l = ['info', 'error', 'debug', 'fatal', 'trace', 'warn'];
  for (var i = l.length - 1; i >= 0; i--) {
    log = overwrite_level(log, l[i]);
  }
  return log;
};