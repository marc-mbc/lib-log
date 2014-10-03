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

  return require('bunyan').createLogger({
    name: config.server.name,
    src: config.log.log_src,
    streams: streams,
    serializers: require('restify').bunyan.serializers
  });
}