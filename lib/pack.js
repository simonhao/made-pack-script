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
var escodegen  = require('escodegen');

function Pack(options, transform){
  this.options = extend({
    basedir: process.cwd(),
    entry: 'index.js',
    ext: '.js'
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

    self._require[filename] = {
      deps: [],
      str: ''
    };

    if(entry){
      this._entry[filename] = true;
    }

    var str = this.check_require(filename, function(dep_filename){
      self._require[filename].deps.push(dep_filename);
      self.require_file(dep_filename);
    }, true);

    self._require[filename].str = str;
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

    this.check_require(filename, function(filename){
      self.external_file(filename);
    });
  },
  not_external: function(filename){
    return path.relative(this.options.basedir, filename)[0] !== '.';
  },
  str: function(filename){
    var extname = path.extname(filename).substring(1);
    var str;

    if(extname in this.transform && this.not_external(filename)){
      str = this.transform[extname](filename);
    }else{
      str = fs.readFileSync(filename, 'utf-8');
    }

    return str;
  },
  ast: function(str, filename){
    var ast;

    try{
      ast = esprima.parse(str, {
        attachComment: true
      });
    }catch(err){
      this.error('Syntax Error: "', filename, '"');
    }

    return ast;
  },
  check_require: function(filename, callback, replace){
    var self = this;

    var str = self.str(filename);
    var ast = self.ast(str, filename);

    var options = {
      filename: filename,
      basedir: this.options.basedir,
      entry: this.options.entry,
      ext: this.options.ext
    };

    var result = estraverse.replace(ast, {
      enter: function(node, parent){
        var module_id, module_path;

        if(node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require'){
          if(node.arguments.length && node.arguments[0].type === 'Literal'){
            module_id = node.arguments[0].value;
            module_path = mid.path(module_id, options);

            if(module_path){
              if(replace){
                node.arguments[0].value = mid.id(module_path, options);
              }
              callback(module_path);
            }else{
              self.error('Cant find module "', module_id, '" from "', filename, ' "');
            }
          }
        }
      }
    });

    if(replace){
      return escodegen.generate(ast, {
        format: {
          indent: {
            style: '  ',
          }
        },
        comment: true
      });
    }

    return str;
  },
  pack: function(){
    var self = this;

    var pack = {};

    var options = {
      basedir: self.options.basedir,
      entry: self.options.entry,
      ext: self.options.ext
    };

    Object.keys(this._require).filter(function(filename){
      return !(filename in self._external);
    }).forEach(function(filename){
      var module_info = self._require[filename];

      pack[filename] = {
        entry: filename in self._entry,
        id: mid.id(filename, options),
        deps: module_info.deps.map(function(filename){
          return mid.id(filename, options);
        }),
        str: module_info.str
      };
    });

    return pack;
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
        entry: self.options.entry,
        ext: self.options.ext
      });

      return [JSON.stringify(module_id),': function(require, module, exports){\n', self._require[filename].str ,'\n}'].join('');

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