/**
 * Made-Build-File
 * @author: SimonHao
 * @date:   2015-11-12 10:31:48
 */

'use strict';

var path   = require('path');
var crypto = require('crypto');
var fs     = require('fs');
var mid    = require('made-id');
var extend = require('extend');

var file_list = {};

var base_path = exports.base_path = path.join(process.cwd(), 'src');
var dist_path = exports.dist_path = path.join(process.cwd(), 'dist');

var static_path = path.join(dist_path, 'static');
var temp_path   = path.join(dist_path, 'temp');

var server = {
  web_domain: '',
  web_path: '/',
  static_domain: '',
  static_path: '/'
};

exports.init = function(options){
  exports.base_path = base_path = options.basedir;
  exports.dist_path = dist_path = options.distdir;

  extend(server, options.server);

  static_path = path.join(dist_path, 'static');
  temp_path   = path.join(dist_path, 'temp');
};

/**
 * 通过ID与选项来寻找一个源文件
 * @param  {String} id      模块ID
 * @param  {Object} options 选项
 * @return {Object}         文件信息实例
 */
exports.search = function(id, options){
  var src = mid.path(id, options);

  if(exports.has(src)){
    return exports.get(src);
  }else{
    console.error('not find file', id);
  }
};

/**
 * 获取文件
 * @param  {String} src 文件源地址
 * @return {Object}     文件信息
 */
exports.get = function(src){
  if(exports.has(src)){
    return file_list[src];
  }else{
    console.error('no such file', src);
  }
};

/**
 * 判断是否存在该文件
 * @param  {String}  src 源文件路径
 * @return {Boolean}     是否存在
 */
exports.has = function(src){
  return src in file_list;
};

/**
 * 通过源文件来增加一个静态文件
 * @param {String} src 源文件目录
 */
exports.set = function(src){
  if(exports.has(src)){
    return exports.get(src);
  }else{
    return file_list[src] = new FileInfo(src);
  }
};
/**
 * 获取临目录
 * @param  {String} id 临时文件夹名
 * @return {String}    临时文件夹路径
 */
exports.temp = function(id){
  return path.join(temp_path, id);
};


/**
 * 生成文件的MD5
 * @param  {String} file_path 文件路径
 * @return {String}           文件的MD5值
 */
function gen_file_md5(file_path){
    var file_str = fs.readFileSync(file_path, 'utf-8');

    return crypto.createHash('md5').update(file_str).digest('hex').substring(0,8);
}

function FileInfo(src){
  this.src = src;

  this._md5 = null;
  this._dist = null;
  this._url = null;
}

/**
 * 获取静态文件的生成路径
 * @return {String} 路径名
 */
FileInfo.prototype.dist = function(){
  if(this._dist) return this._dist;

  var relative_path = path.relative(base_path, this.src);

  var dist_path = path.join(static_path, relative_path);
  var dist_info;

  if(this.md5){
    dist_info = path.parse(dist_path);
    dist_info.base = dist_info.name + '.' + this.md5 + dist_info.ext;

    dist_path = path.format(dist_info);
  }

  this._dist = dist_path;

  return dist_path;
};

/**
 * 获取静态文件的URL路径
 * @return {String} URL
 */
FileInfo.prototype.url = function(){
  if(this._url) return this._url;

  var relative_path = path.relative(static_path, this.dist());
  var url = server.static_domain + server.static_path + relative_path.split(path.sep).join('/');

  this._url = url;

  return url;
};

/**
 * 给静态文件增加版本号
 */
FileInfo.prototype.version = function(){
  var dist_path = this.dist();
  var file_md5  = gen_file_md5(dist_path);
  var path_info = path.parse(dist_path);

  this._md5  = file_md5;
  this._dist = null;
  this._url  = null;

  path_info.base = path_info.name + '.' + file_md5 + path_info.ext;

  return fs.renameSync(dist_path, path.format(path_info));
};









