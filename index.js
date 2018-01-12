#!/usr/bin/env node

'use strict';

const cfork = require('cfork');

const path = require('path');
const util = require('util');
const config = require('config');

const logger = require('server/middlewares/logger').logger;

const bootPath = path.join(__dirname, 'server/boot');
cfork({
  exec: bootPath,
  env: {
    'NODE_PATH': 'server:.'
  },
  count: config('clusterCount') || 4
})
  .on('fork', worker => {
    logger.info('[worker:%d] new worker start', worker.process.pid);
  })
  .on('disconnect', worker => {
    logger.error('[master:%s] wroker:%s disconnect, exitedAfterDisconnect: %s, state: %s.',
      process.pid, worker.process.pid, worker.exitedAfterDisconnect, worker.state);
  })
  .on('exit', (worker, code, signal) => {
    const exitCode = worker.process.exitCode;
    const err = new Error(util.format('worker %s died (code: %s, signal: %s, exitedAfterDisconnect: %s, state: %s)',
      worker.process.pid, exitCode, signal, worker.exitedAfterDisconnect, worker.state));
    err.name = 'WorkerDiedError';
    logger.error('[master:%s] wroker exit: %s', process.pid, err.stack);
  })

  // if you do not listen to this event
  // cfork will output this message to stderr
  .on('unexpectedExit', (worker, code, signal) => {
    const exitCode = worker.process.exitCode;
    const propertyName = worker.hasOwnProperty('exitedAfterDisconnect') ? 'exitedAfterDisconnect' : 'suicide';
    const err = new Error(util.format('worker:%s died unexpected (code: %s, signal: %s, %s: %s, state: %s)',
      worker.process.pid, exitCode, signal, propertyName, worker[propertyName], worker.state));
    err.name = 'WorkerDiedUnexpectedError';
    logger.error('[cfork:master:%s]  unexpected exit %s',
      process.pid, err.stack);
  })

  // emit when reach refork times limit
  .on('reachReforkLimit', () => {
    logger.error('reachReforkLimit');
  });

// if you do not listen to this event
// cfork will listen it and output the error message to stderr
process.on('uncaughtException', err => {
  logger.error('[cfork:master:%s] master uncaughtException: %s', process.pid, err.stack);
  logger.error(err);
  setTimeout(() => {
    process.exit(1);
  }, 10000);
});
