'use strict';

const fs = require('fs');
const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const mocks = require('./mocks.js');
const isEqual = require('./isEqual.js');
const apiPath = '../../api';
const testPath = path.join(__dirname, '../');

const MockedApp = mocks.app;
const MockedBase = mocks.base;
const MockedAsync = mocks.async;

let resetThis = function (testUnit) {
  /* Reset the request object (app.req) about user input (beyond 'cookies', 'session' etc.). */
  ['body', 'query', 'params', 'novaBody', 'cinderBody', 'neutronBody'].forEach( s => {
    testUnit[s] = undefined;
  });
};

let doTheTest = function (apiName, testUnit, thePath, theMethod, singleTest) {

  it('Normal test for ' + apiName, function (done) {
    resetThis(testUnit);
    /* Set input of request. */
    Object.keys(singleTest.input).forEach( s => {
      if (testUnit.app.req[s]) {
        Object.assign(testUnit.app.req[s], singleTest.input[s]);
      } else {
        testUnit.app.req[s] = singleTest.input[s];
      }
    });

    /* Set false of error trigger. */
    testUnit.triggerError = false;

    /* Send request. */
    testUnit.app[theMethod].emit(thePath);

    // fs.writeFileSync(__dirname + '/' + apiName + '.tmp.js', JSON.stringify(testUnit.app.res.testResult, null, 2));

    /* Test result locates at app.res.testsResult. */
    let testResult = testUnit.app.res.testResult;

    /* Verify api output. */
    if (singleTest.output) {
      let output = isEqual(testResult.output, singleTest.output);
      expect(output).toBe(true);
    }

    /* Verify status code, if retruned! */
    if (singleTest.status) {
      let status = isEqual(testResult.status, singleTest.status);
      expect(status).toBe(true);
    }

    /* verify processed request. */
    if (singleTest.processedRequest) {
      let processedRequest = isEqual(testUnit.app.req.session.cookie.expires, singleTest.processedRequest.session.cookie.expires);
      expect(processedRequest).toBe(true);
    }

    done();
  });

  /* Default is true.
   * The error test has no relation with input.
   * It is just a test of coverage of codes.
   */
  if (!singleTest.noError) {
    it('Error test for ' + apiName, function (done) {
      resetThis(testUnit);
      testUnit.triggerError = true;
      testUnit.app[theMethod].emit(thePath);
      let status = isEqual(testUnit.app.res.testResult.status, 500);
      expect(status).toBe(true);
      done();
    });
  }

};

fs.readdirSync(testPath)
  .filter(f => {
    return f !== 'helpers' && f !== '.DS_Store';
  })
  .forEach(m => {
    describe('Test for ' + m, function () {
      /* Get test options. */
      let testService = require(path.join(testPath, m)); // keypair.js ...
      let test = testService.test;
      let exchange = {
        '../base.js': MockedBase,
        'async': MockedAsync
      };

      /* Mock the tested file. */
      let TestUnit = proxyquire(path.join(apiPath, testService.path), exchange);
      let testApp = new MockedApp();
      let testUnit = new TestUnit(testApp);

      /* Travel each unit for test. */
      Object.keys(test).forEach(apiName => {
        let theTest = test[apiName];
        let thePath = theTest.path;
        let theMethod = theTest.method ? (theTest.method + 'Event') : 'getEvent';

         /* A fix for several times tests. */
        if (theTest.tasks && theTest.tasks.length) {
          theTest.tasks.forEach( (singleTest, index) => {
            doTheTest(apiName, testUnit, thePath, theMethod, singleTest);
          });
        } else {
          /* Only once test. */
          doTheTest(apiName, testUnit, thePath, theMethod, theTest);
        }

      });

    });
  });
