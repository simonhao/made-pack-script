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
})