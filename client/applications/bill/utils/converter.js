/**
 * @func: convert obj value into specific language
 */
module.exports = {
  getLangValue(lang, obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
      let strs = '';
      obj.forEach((str) => {
        strs += lang[str];
      });

      return strs;
    } else {
      return obj;
    }
  },
  convertLang(lang, config) {
    if (config.table) {
      config.table.column.forEach((col) => {
        col.title = this.getLangValue(lang, col.title);
        if (col.filterAll) {
          col.filterAll = this.getLangValue(lang, col.filterAll);
        }
        if (col.filter) {
          col.filter.forEach((filter) => {
            filter.name = this.getLangValue(lang, filter.name);
          });
        }
      });
    }
    if (config.table.detail) {
      config.table.detail.tabs.forEach((tab) => {
        tab.name = this.getLangValue(lang, tab.name);
      });
    }
  }
};
