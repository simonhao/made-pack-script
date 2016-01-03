/**
 * test
 * @author: SimonHao
 * @date:   2016-01-03 13:12:12
 */

'use strict';

var Pack = require('../lib/pack.js');
var fs = require('fs');


var made_script = require('made-script');
var made_view   = require('made-view');


var options = {
  basedir: __dirname
};

var transform = {
  'js': function(filename){
    var result = made_script.compile_file(filename, options);

    return result;
  },
  'tpl': function(filename){
    var result = made_view.compile_client_file(filename, options);

    return 'exports._default = ' + result;
  }
};

var comm_pack = new Pack(options, transform);

comm_pack.add('comm/fetch');
comm_pack.require(['comm/base', 'comm/net', 'extend']);

fs.writeFileSync(__dirname + '/comm_lib.js', comm_pack.bundle());

var index_pack = new Pack(options, transform);

index_pack.require('page/index');
index_pack.external(['comm/base', 'comm/net', 'extend']);

fs.writeFileSync(__dirname + '/page_lib.js', index_pack.bundle());