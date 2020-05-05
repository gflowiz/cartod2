define(['exports'], function (exports) { 'use strict';

  var sum = function (a, b) {
    return a + b;
  };

  var src = {
  	sum: sum
  };

  exports.default = src;
  exports.sum = sum;

  Object.defineProperty(exports, '__esModule', { value: true });

});
