/**
 * wrap
 * @author: SimonHao
 * @date:   2016-01-02 11:39:17
 */

require = (function(modules, entry){

  var prev_require = typeof require === 'function' && require;
  var cache = {};

  function new_require(module_id){
    var module;

    if(!cache[module_id]){
      if(!modules[module_id]){
        if(prev_require){
          return prev_require(module_id);
        }else{
          throw new Error('Cannot find module \'' + module_id + '\'');
        }
      }else{
        module = cache[module_id] = {exports:{}};
        modules[module_id].call(module.exports, new_require, module, module.exports);
      }
    }

    return cache[module_id].exports;
  }

  entry.forEach(function(module_id){
    new_require(module_id);
  });

  return new_require;
})({"comm/fetch": function(require, module, exports){
/**
 * fetch
 * @author: SimonHao
 * @date:   2016-01-03 13:11:49
 */
'use strict';
},"comm/base": function(require, module, exports){
/**
 * base
 * @author: SimonHao
 * @date:   2016-01-03 13:11:15
 */
'use strict';
},"comm/net": function(require, module, exports){
/**
 * net
 * @author: SimonHao
 * @date:   2016-01-03 13:11:22
 */
'use strict';
var bind = require('comm/bind');
var alert = require('comm/alert.tpl');
},"comm/bind": function(require, module, exports){
/**
 * bind
 * @author: SimonHao
 * @date:   2016-01-03 13:11:31
 */
'use strict';
var net = require('comm/net');
},"comm/alert.tpl": function(require, module, exports){
var __made_view = require('made-view/runtime');
module.exports = function (__made_locals) {
  var __made_buf = [];
  var __made_block = __made_block || {};
  var __made_locals = __made_locals || {};
  ;
  (function () {
    __made_buf.push('\n<div id="comm-alert.tpl-wrap" class="comm-alert.tpl-wrap">\n  <div>content</div>\n</div>');
  }());
  return __made_buf.join('');
};
},"made-view/runtime": function(require, module, exports){
/**
 * Made-View Runtime
 * @author: SimonHao
 * @date:   2015-10-09 15:11:34
 */
'use strict';
exports.encode = function (html) {
  var result = String(html).replace(/[&<>"]/g, function (escape_char) {
    var encode_map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };
    return encode_map[escape_char] || escape_char;
  });
  if (result === '' + html)
    return html;
  else
    return result;
};
exports.each = function (list, callback) {
  if (Array.isArray(list)) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  } else if (typeof list === 'object' && list !== null) {
    Object.keys(list).forEach(function (key) {
      callback(list[key], key);
    });
  } else {
    callback(list, 0);
  }
};
exports.block = function (blocks, block_name, block_content) {
  var content = blocks[block_name];
  if (content) {
    content[0] && content[0]();
    content[1] && content[1]();
    if (!content[1]) {
      block_content();
    }
    content[2] && content[2]();
  }
};
},"extend": function(require, module, exports){
'use strict';
var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var isArray = function isArray(arr) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arr);
  }
  return toStr.call(arr) === '[object Array]';
};
var isPlainObject = function isPlainObject(obj) {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }
  var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');  // Not own constructor property must be Object
  // Not own constructor property must be Object
  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }  // Own properties are enumerated firstly, so to speed up,
     // if last one is own, then all properties are own.
  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  var key;
  for (key in obj) {
  }
  return typeof key === 'undefined' || hasOwn.call(obj, key);
};
module.exports = function extend() {
  var options, name, src, copy, copyIsArray, clone, target = arguments[0], i = 1, length = arguments.length, deep = false;  // Handle a deep copy situation
  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};  // skip the boolean and the target
    // skip the boolean and the target
    i = 2;
  } else if (typeof target !== 'object' && typeof target !== 'function' || target == null) {
    target = {};
  }
  for (; i < length; ++i) {
    options = arguments[i];  // Only deal with non-null/undefined values
    // Only deal with non-null/undefined values
    if (options != null) {
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];  // Prevent never-ending loop
        // Prevent never-ending loop
        if (target !== copy) {
          // Recurse if we're merging plain objects or arrays
          if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }  // Never move original objects, clone them
            // Never move original objects, clone them
            target[name] = extend(deep, clone, copy);  // Don't bring in undefined values
          } else // Don't bring in undefined values
          if (typeof copy !== 'undefined') {
            target[name] = copy;
          }
        }
      }
    }
  }  // Return the modified object
  // Return the modified object
  return target;
};
}},["comm/fetch"]);