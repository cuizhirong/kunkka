/**
 * Data storage used as cache
 */

var storage = {},
  cache = {};

Object.defineProperties(storage, {
  set: {
    value: function(type, value, force) { // TODO: force is used to identify if the data is forced to refresh
      var d = cache[type];
      if ((!d || d.length === 0) && Array.isArray(value)) {
        cache[type] = value;
        return true;
      }
      return false;
    }
  },
  get: {
    value: function(type, key, value) {
      var ret = null;
      cache[type].some(function(m, i) {
        if (m[key] === value) {
          ret = m;
          return true;
        }
        return false;
      });
      return ret;
    }
  },
  mix: {
    value: function(types) {
      return types.map(function(t) {
        return cache[t];
      });
    }
  },
  splice: {
    value: function(type, index, num, value) {
      return cache[type].splice(index, num, value);
    }
  },
  update: {
    value: function(type, key, value, data) {
      cache[type].some(function(m, i) {
        if (m[key] === value) {
          cache[type][i] = data;
          return true;
        }
        return false;
      });
    }
  },
  del: {
    value: function(type, key, value) {
      cache[type].some(function(m, i) {
        if (m[key] === value) {
          cache[type].splice(i, 1);
          return true;
        }
        return false;
      });
    }
  },
  clear: {
    value: function(type) {
      cache[type] = [];
    }
  },
  data: {
    value: function(type) {
      return cache[type];
    }
  },
  length: {
    value: function(type) {
      return cache[type].length;
    }
  }
});
try {
  if (window) {
    window.storage = storage;
  }
} catch (e) {
  console.log('mock window');
}

module.exports = storage;
