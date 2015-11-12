/**
 * Made-Pack-Script
 * @author: SimonHao
 * @date:   2015-11-12 10:31:48
 */

'use strict';

var browserify = require('browserify');
var path       = require('path');

module.exports = function(options, done){
  var base_path = options.basedir || path.join(process.cwd(), 'src');

  var bundle = browserify({
      paths: [base_path]
  });

  bundle.add(options.entry);
  bundle.require(options.require);
  bundle.external(options.external);

  bundle.bundle(function(err, script){
    if(err){
        console.error(err.toString());
        done && done(err, '');
    }else{
        done && done(null, script);
    }
  });

};