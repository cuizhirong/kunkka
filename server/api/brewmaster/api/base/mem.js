'use strict';

const setKeyValueAsync = function* ({key, value, expire, memClient}) {
  const createdAt = new Date().getTime();
  yield memClient.setAsync(key, JSON.stringify({value, createdAt, expire}), expire);
};
const getObjAsync = function* (key, memClient) {
  let memValue = yield memClient.getAsync(key.toString());
  let result = null;
  memValue = memValue[0] && memValue[0].toString();
  if (memValue) {
    try {
      result = JSON.parse(memValue);
    } catch (e) {
      result = null;
    }
  }
  return result;
};

const verifyKeyValueAsync = function* (key, value, memClient) {
  let memValue = yield getObjAsync(key, memClient);
  if (!memValue) {
    return false;
  } else {
    return memValue.value.toString() === value.toString();
  }
};
module.exports = {
  verifyKeyValueAsync,
  getObjAsync,
  setKeyValueAsync
};
