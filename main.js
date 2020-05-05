(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.clustering = global.clustering || {}));
}(this, (function (exports) { 'use strict';

  var sum = function (a, b) {
    return a + b;
  };

  var src = {
  	sum: sum
  };

  exports.default = src;
  exports.sum = sum;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
