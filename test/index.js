/**
 * test
 * @author: SimonHao
 * @date:   2016-01-03 13:12:12
 */

'use strict';

var Pack = require('../lib/pack.js');
var fs = require('fs');
var script_pack = require('../index.js');

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

    return result;
  }
};

var comm_pack = new Pack(options, transform);

comm_pack.add('comm/fetch');
comm_pack.require(['comm/base', 'comm/net', 'extend']);
console.log(comm_pack.pack());
/*fs.writeFileSync(__dirname + '/comm_lib.js', comm_pack.bundle());*/


var result = script_pack({
  basedir: options.basedir,
  require:['page/index'],
  external: ['comm/base', 'comm/net', 'extend']
}, transform);

fs.writeFileSync(__dirname + '/page_lib.js', result);