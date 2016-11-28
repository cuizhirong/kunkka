/**
 * @func: convert obj value into specific language
 */
module.exports = {
  getLangValue(lang, obj) {
    if (toString.call(obj) === '[object Array]') {
      var strs = '';
      obj.forEach((str) => {
        strs += lang[str];
      });

      return strs;
    } else {
      return obj;
    }
  },

  convertLang(lang, config) {
    if (config.tabs) {
      config.tabs.forEach((item) => {
        item.name = this.getLangValue(lang, item.name);
      });
    }
  }
};
