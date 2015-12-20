/**
 * Module Transform
 * @author: SimonHao
 * @date:   2015-12-20 12:03:45
 */

'use strict';

var through = require('through');
var compile = require('made-script');
var extend  = require('extend');

module.exports = function(options, transform){
  var options = extend({
    basedir: process.cwd(),
    filename: __filename,
    entry: 'index.js',
    ext: '.js'
  }, options);

  var data = '';

  function write(buf){
    data += buf;
  }

  function end(){
    this.queue(compile(options.filename, options, transform));
    this.queue(null);
  }

  return through(write, end);
};