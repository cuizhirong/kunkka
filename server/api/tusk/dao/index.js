'use strict';

const tusk = require('../models');

function sortCache(cache) {
  let objCache = {};
  for (let i = 0, l = cache.length; i < l; i++) {
    if ( !objCache[cache[i].app] ) {
      objCache[cache[i].app] = [];
    }
    objCache[cache[i].app].push(cache[i]);
  }
  return objCache;
}

function transformSqlBoolean(result) {
  if (result instanceof Array) {
    result.forEach( s => {
      if (s.type === 'boolean') {
        s.value = (s.value === 'true' || s.value === '1') ? true : false;
      } else if (s.type === 'number') {
        s.value = Number(s.value);
      }
    });
  } else if (result && result.value && result.type === 'boolean') {
    result.value = (result.value === 'true' || result.value === '1' || result.value === true) ? true : false;
  }
  return result;
}

function transformCacheBoolean(cache) {
  Object.keys(cache).forEach( c => {
    cache[c].forEach( s => {
      if (s.type === 'boolean') {
        s.value = (s.value === 'true' || s.value === '1' || s.value === true) ? true : false;
      } else if (s.type === 'number') {
        s.value = Number(s.value);
      }
    });
  });
  return cache;
}

function _findAll(cache) {
  if (cache) {
    return Promise.resolve(transformCacheBoolean(cache));
  } else {
    return tusk.findAll({raw: true})
    .then((data) => {
      data = sortCache(transformSqlBoolean(data));
      if (exports.cacheClient) {
        exports.cacheClient.set('settings', JSON.stringify(data));
      }
      return Promise.resolve(data);
    })
    .catch(err => {
      return Promise.reject(err);
    });
  }
}

function _findAllByApp(name, cache) {
  if (cache) {
    cache = transformCacheBoolean(cache);
    return Promise.resolve(cache[name] ? cache[name] : []);
  } else {
    return tusk.findAll({ raw: true, where: { app: name } })
    .then( data => {
      return Promise.resolve(transformSqlBoolean(data));
    })
    .catch( err => {
      return Promise.reject(err);
    });
  }
}

function _findOneByAppAndName(app, name, cache) {
  if (cache) {
    cache = transformCacheBoolean(cache);
    let back;
    Object.keys(cache).some( s => {
      cache[s].some( t => {
        if (t.app === app && t.name === name) {
          back = t;
          return true;
        }
      });
    });
    return Promise.resolve(back);
  } else {
    return tusk.findOne({raw: true, where: {app, name} })
    .then( data => Promise.resolve(transformSqlBoolean(data)))
    .catch( err => Promise.reject);
  }
}

function _findOneById(id, cache) {
  if (cache) {
    cache = transformCacheBoolean(cache);
    let back = '';
    Object.keys(cache).some( s => {
      cache[s].some( t => {
        return (t.id === Number(id)) && (back = t);
      });
      return back;
    });
    return Promise.resolve(back);
  } else {
    return tusk.findOne({raw: true, where: {id: id } })
    .then( data => {
      return Promise.resolve(transformSqlBoolean(data));
    })
    .catch( err => {
      return Promise.reject(err);
    });
  }
}

function _createOne(set, cache) {
  return tusk.create(set)
  .then( data => {
    return _findAll(null);
  })
  .catch( err => {
    return Promise.reject(err);
  });
}

function _updateOneById(id, set, cache) {
  return tusk.update(set, {where: {id: id } })
  .then( data => {
    return _findAll(null);
  })
  .catch( err => {
    return Promise.reject(err);
  });
}

function _deleteOneById(id, cache) {
  return tusk.destory({where: {id: id } })
  .then( data => {
    return _findAll(null);
  })
  .catch( err => {
    return Promise.reject(err);
  });
}

// @return Promise
function handleData (refresh, method) {
  // check cache.
  if (!refresh && exports.cacheClient) {
    return new Promise( (resolve, reject) => {
      exports.cacheClient.get('settings', function (err, cache) {
        if (err || cache === null) {
          resolve(method(null));
        } else {
          let _cache;
          try {
            _cache = JSON.parse(cache);
          } catch (e) {
            _cache = null;
          }
          resolve(method(_cache));
        }
      });
    });
  } else {
    return method(null);
  }
}

/* handle with data. */
exports.getAllSettings = function (refresh) {
  return handleData(refresh, _findAll);
};

exports.getSettingsByApp = function (name, refresh) {
  return handleData(refresh, _findAllByApp.bind(undefined, name));
};

exports.getSettingByAppAndName = function (app, name, refresh) {
  return handleData(refresh, _findOneByAppAndName.bind(undefined, app, name));
};

exports.getSettingById = function (id, refresh) {
  return handleData(refresh, _findOneById.bind(undefined, id));
};

exports.createSetting = function (set) {
  return handleData(true, _createOne.bind(undefined, set));
};

exports.updateSettingById = function (id, set) {
  return handleData(true, _updateOneById.bind(undefined, id, set));
};

exports.deleteSettingById = function (id) {
  return handleData(true, _deleteOneById.bind(undefined, id));
};
