/**
 * @func: convert obj value into specific language
 */
module.exports = {
  getPenultimate(config, keys) {
    return (function fn(obj, entry, i = 0) {
      if (i === 0) {
        return (entry.length <= 1) ? obj : fn(obj[entry[i]], entry, i + 1);
      } else if (i < entry.length - 1) {
        return fn(obj[entry[i]], entry, i + 1);
      } else if (i === entry.length - 1) {
        return obj;
      }
    })(config, keys);
  },

  getLangValue(lang, obj) {
    var strs = '';
    obj.map((str) => {
      strs += lang[str];
    });

    return strs;
  },

  convertLang(lang, config, items) {
    items.forEach((entry) => {
      var obj = this.getPenultimate(config, entry),
        key = entry[entry.length - 1];

      if (obj.length >= 0) {
        obj.forEach((data) => {
          data[key] && (data[key] = this.getLangValue(lang, data[key]));
        });
      } else {
        obj[key] && (obj[key] = this.getLangValue(lang, obj[key]));
      }
    });

    return config;
  }
};
