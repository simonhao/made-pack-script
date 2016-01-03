/**
 * Made-Pack-Script
 * @author: SimonHao
 * @date:   2016-01-03 13:47:45
 */

'use strict';

var Pack   = require('./lib/pack');
var extend = require('extend');

module.exports = function(options, transform){
  var options = extend({
    basedir: process.cwd(),
    entry: 'index.js',
    ext: '.js',
    require: [],
    add: [],
    external: []
  }, options);

  var script_pack = new Pack({
    basedir: options.basedir,
    entry: options.entry,
    ext: options.ext
  }, transform);

  script_pack.add(options.add);
  script_pack.require(options.require);
  script_pack.external(options.external);

  return script_pack.bundle();
};


module.exports.Pack = Pack;