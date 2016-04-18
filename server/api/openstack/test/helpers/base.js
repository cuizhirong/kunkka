'use strict';

const fs = require('fs');
const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const mocks = require('./mocks.js');
const apiPath = '../../api';
const testPath = path.join(__dirname, '../');

const ExchangeApp = mocks.app;
const ExchangeBase = mocks.base;
const ExchangeAsync = mocks.async;

const isEqual = function () {
  let i, l, leftChain, rightChain;

  const compare2Objects = function (x, y) {
    let p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
      return true;
    }
    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on step when comparing prototypes
    if (x === y) {
      return true;
    }
    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
      (x instanceof Date && y instanceof Date) ||
      (x instanceof RegExp && y instanceof RegExp) ||
      (x instanceof String && y instanceof String) ||
      (x instanceof Number && y instanceof Number)) {
      return x.toString() === y.toString();
    }
    // At last checking prototypes as good a we can
    if (!(x instanceof Object && y instanceof Object)) {
      return false;
    }
    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
      return false;
    }
    if (x.constructor !== y.constructor) {
      return false;
    }
    if (x.prototype !== y.prototype) {
      return false;
    }
    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
      return false;
    }
    // Quick checking of one object beeing a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (typeof y[p] !== typeof x[p]) {
        return false;
      }
    }
    for (p in x) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (typeof y[p] !== typeof x[p]) {
        return false;
      }

      switch (typeof (x[p])) {
        case 'object':
        case 'function':
          leftChain.push(x);
          rightChain.push(y);
          if (!compare2Objects(x[p], y[p])) {
            return false;
          }
          leftChain.pop();
          rightChain.pop();
          break;
        default:
          if (x[p] !== y[p]) {
            return false;
          }
          break;
      }
    }
    return true;
  };
  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw 'Need two or more arguments to compare';
  }
  for (i = 1, l = arguments.length; i < l; i++) {
    leftChain = []; //Todo: this can be cached
    rightChain = [];
    if (!compare2Objects(arguments[0], arguments[i])) {
      return false;
    }
  }
  return true;
};

fs.readdirSync(testPath)
  .filter(f => {
    return f !== 'helpers' && f !== '.DS_Store';
  })
  .forEach(m => {
    describe('Test for ' + m, function () {
      let testService = require(path.join(testPath, m)); // keypair.js ...
      let test = testService.test;
      let exchange = {
        '../base.js': ExchangeBase,
        'async': ExchangeAsync
      };
      let TestUnit = proxyquire(path.join(apiPath, testService.path), exchange);
      let testApp = new ExchangeApp();
      let testUnit = new TestUnit(testApp);
      Object.keys(test).forEach(p => {
        it('Normal test for ' + p, function (done) {
          testUnit.triggerError = false;
          testUnit.app.getEvent.emit(test[p].path);
          let testResult = isEqual(testUnit.app.res.testResult, test[p].out);
          expect(testResult).toBe(true);
          done();
        });
        it('Error test for ' + p, function (done) {
          testUnit.triggerError = true;
          testUnit.app.getEvent.emit(test[p].path);
          done();
        });
      });
    });
  });
