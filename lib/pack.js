/**
 * made script pack
 * @author: SimonHao
 * @date:   2016-01-02 11:38:59
 */

'use strict';

var extend     = require('extend');
var path       = require('path');
var mid        = require('made-id');
var fs         = require('fs');
var esprima    = require('esprima');
var estraverse = require('estraverse');

function Pack(options, transform){
  this.options = extend({
    basedir: process.cwd(),
    entry: 'index.js',
    ext: '.js',
  }, options);

  this.transform = transform || {};

  this._entry    = {};
  this._external = {};
  this._require  = {};

  this._bundle = {};
}

Pack.prototype = {
  constructor: Pack,
  error: function(){
    console.error.apply(arguments, arguments);
  },
  add: function(file){
    this.require(file, true);
  },
  require: function(file, entry){
    var self = this;

    if(Array.isArray(file)){
      file.forEach(function(f){
        self.require(f, entry);
      });
      return;
    }

    var filename;

    if(path.isAbsolute(file)){
      filename = file;
    }else{
      filename = mid.path(file, this.options);
    }

    if(fs.existsSync(filename) && fs.statSync(filename).isFile()){
      self.require_file(filename, entry);
    }else{
      self.error('Cont find require module "', file, '"');
    }
  },
  require_file: function(filename, entry){
    var self = this;

    if(filename in self._require || filename in self._external) return;

    var str = this.str(filename);

    this._require[filename] = str;

    if(entry){
      this._entry[filename] = true;
    }

    this.check_require(str, filename, function(filename){
      self.require_file(filename);
    });
  },
  external: function(file){
    var self = this;

    if(Array.isArray(file)){
      file.forEach(function(f){
        self.external(f);
      });
      return;
    }

    var filename;

    if(path.isAbsolute(file)){
      filename = file;
    }else{
      filename = mid.path(file, this.options);
    }

    if(fs.existsSync(filename) && fs.statSync(filename).isFile()){
      this.external_file(filename);
    }else{
      self.error('Cont find external module "', file, '"');
    }
  },
  external_file: function(filename){
    var self = this;

    if(filename in self._external) return;

    this._external[filename] = true;

    var str = this.str(filename);

    this.check_require(str, filename, function(filename){
      self.external_file(filename);
    });
  },
  str: function(filename){
    var extname = path.extname(filename).substring(1);
    var str;

    if(extname in this.transform){
      str = this.transform[extname](filename);
    }else{
      str = fs.readFileSync(filename, 'utf-8');
    }

    return str;
  },
  check_require: function(str, filename, callback){
    var self = this;
    var ast;

    try{
      ast = esprima.parse(str);
    }catch(err){
      this.error('Made-Pack-Script: Synatx Error: "', filename, ' "');
    }

    var options = {
      filename: filename,
      basedir: this.options.basedir,
      entry: this.options.entry,
      ext: this.options.ext
    };

    estraverse.traverse(ast, {
      enter: function(node, parent){
        if(node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require'){
          if(node.arguments.length && node.arguments[0].type === 'Literal'){
            var module_id = node.arguments[0].value;
            var module_path = mid.path(module_id, options);

            if(module_path){
              callback(module_path);
            }else{
              self.error('Cant find module "', module_id, '" from "', filename, ' "');
            }
          }
        }
      }
    });
  },
  bundle: function(){
    var self = this;

    var bundle = [];

    bundle.push(fs.readFileSync(__dirname + '/wrap.js', 'utf-8'));
    bundle.push('({');
    bundle.push(Object.keys(this._require).filter(function(filename){
      return !(filename in self._external);
    }).map(function(filename){
      var module_id = mid.id(filename, {
        basedir: self.options.basedir,
        entry: 'index.js',
        ext: '.js'
      });

      return [JSON.stringify(module_id),': function(require, module, exports){\n', self._require[filename] ,'\n}'].join('');

    }).join(','));
    bundle.push('},');
    bundle.push('[');
    bundle.push(Object.keys(this._entry).map(function(filename){
      return JSON.stringify(mid.id(filename, {
        basedir: self.options.basedir,
        entry: 'index.js',
        ext: '.js'
      }));
    }).join(','));
    bundle.push(']);');

    return bundle.join('');
  }
};

module.exports = Pack;