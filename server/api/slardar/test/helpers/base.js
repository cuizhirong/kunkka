'use strict';

const fs = require('fs');
const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const mocks = require('./mocks.js');
const isEqual = require('./isEqual.js');
const apiPath = '../../api';
const testPath = path.join(__dirname, '../');

const ExchangeApp = mocks.app;
const ExchangeBase = mocks.base;
const ExchangeAsync = mocks.async;

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
        let method = test[p].method ? (test[p].method + 'Event') : 'getEvent';
        /* set input of request. */
        Object.keys(test[p].input).forEach( s => {
          if (testUnit.app.req[s]) {
            Object.assign(testUnit.app.req[s], test[p].input[s]);
          } else {
            testUnit.app.req[s] = test[p].input[s];
          }
        });
        it('Normal test for ' + p, function (done) {
          /* set false of error trigger. */
          testUnit.triggerError = false;
          /* send request. */
          testUnit.app[method].emit(test[p].path);
          /* compare res.send / res.json etc. */
          // fs.writeFileSync(__dirname + '/' + p + '.tmp.js', JSON.stringify(testUnit.app.res.testResult, null, 2));
          if (testUnit.app.res.testResult.output) {
            let output = isEqual(testUnit.app.res.testResult.output, test[p].output);
            expect(output).toBe(true);
          }
          /* compare status code, if retruned! */
          if (testUnit.app.res.testResult.status) {
            let status = isEqual(testUnit.app.res.testResult.status, test[p].status);
            expect(status).toBe(true);
          }
          done();
        });
        it('Error test for ' + p, function (done) {
          /* temporarily, error test has no relation with input, which is just a test of coverage of codes. */
          testUnit.triggerError = true;
          testUnit.app[method].emit(test[p].path);
          let status = isEqual(testUnit.app.res.testResult.status, 500);
          expect(status).toBe(true);
          done();
        });
      });
    });
  });
