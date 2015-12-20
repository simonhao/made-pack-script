/**
 * Template Transform
 * @author: SimonHao
 * @date:   2015-12-20 12:03:52
 */

'use strict';

var through = require('through');
var made    = require('made-view');
var extend  = require('extend');

module.exports = function(options, transform){
  var options = extend({
    basedir: process.cwd(),
    filename: __filename,
    entry: 'view.tpl',
    ext: '.tpl'
  }, options);

  var data = '';

  function write(buf){
    data += buf;
  }

  function end(){
    this.queue('var made = require("made-runtime");\n');
    this.queue('module.exports = ' + made.compile_client(data, options, transform));
    this.queue(null);
  }

  return through(write, end);
};