/**
 * Made-Pack-Script
 * @author: SimonHao
 * @date:   2015-11-12 10:31:48
 */

'use strict';

var browserify = require('browserify');
var path       = require('path');
var through    = require('through');

var module_transform   = require('./lib/module');
var template_transform = require('./lib/template');

module.exports = function(options, done){
  var base_path = options.basedir || path.join(process.cwd(), 'src');

  var bundle = browserify({
      paths: [base_path]
  });

  bundle.add(options.entry || []);
  bundle.require(options.require || []);
  bundle.external(options.external || []);

  bundle.transform(function(file){
    if(file.indexOf('node_modules') >= 0){
      return through(function(buf){
        this.queue(buf);
      }, function(){
        this.queue(null);
      });
    }else if(path.extname(file) === '.js'){
      return module_transform({
        filename: file,
        basedir: base_path,
      }, options.script_transform);
    }else if(path.extname(file) === '.tpl'){
      return template_transform({
        filename: file,
        basedir: base_path
      }, options.template_transform);
    }else{
      console.error('Unknow Module File', file);
    }
  }, {global: true});

  bundle.bundle(function(err, script){
    if(err){
        console.error(err.toString());
        done && done(err.toString());
    }else{
        done && done(script);
    }
  });
};